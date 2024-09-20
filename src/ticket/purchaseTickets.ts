import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { ContractInteractor } from '../contractInteractor'
import { AddressSchema, NULL_ADDRESS } from '../utils'

const PurchaseTicketsSchema = z.object({
  ticketProxy: AddressSchema,
  showId: z.string(),
  tierIndex: z.number(),
  quantity: z.number(),
  paymentToken: AddressSchema,
  value: z.bigint().optional(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type PurchaseTicketsType = z.infer<typeof PurchaseTicketsSchema>

export interface PurchaseTicketsResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createPurchaseTickets =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: PurchaseTicketsType): Promise<PurchaseTicketsResult> => {
    const {
      ticketProxy,
      showId,
      tierIndex,
      quantity,
      paymentToken,
      value,
      chainId
    } = input

    try {
      const validatedInput = PurchaseTicketsSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: TicketABI,
        address: ticketProxy as `0x${string}`,
        functionName: 'purchaseTickets',
        args: [showId, tierIndex, quantity, paymentToken],
        value: paymentToken === NULL_ADDRESS ? BigInt(value ?? 0) : undefined,
        chainId
      })

      // Execute the contract interaction
      const receipt = await contractInteractor.execute({
        address: request.address,
        abi: TicketABI as Abi,
        functionName: request.functionName,
        args: request.args ? [...request.args] : undefined,
        value: paymentToken === NULL_ADDRESS ? BigInt(value ?? 0) : undefined
      })

      return {
        hash: receipt.transactionHash,
        receipt
      }
    } catch (err) {
      console.error('Validation or Execution Error:', err)
      throw err
    }
  }

export const usePurchaseTickets = (
  input: PurchaseTicketsType,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<PurchaseTicketsResult, Error> => {
  const purchaseTickets = useMemo(
    () => createPurchaseTickets(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => purchaseTickets(input),
    onError: error => {
      console.error('Error purchasing tickets:', error)
    }
  })
}
