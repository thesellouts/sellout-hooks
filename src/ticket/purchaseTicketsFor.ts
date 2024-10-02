import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { ContractInteractor } from '../contractInteractor'
import { useContractInteractor } from '../contractInteractor'
import { AddressSchema, NULL_ADDRESS } from '../utils'

const PurchaseTicketsForSchema = z.object({
  recipient: AddressSchema,
  ticketProxy: AddressSchema,
  showId: z.string(),
  tierIndex: z.number(),
  quantity: z.number(),
  paymentToken: AddressSchema,
  value: z.bigint().optional(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type PurchaseTicketsFor = z.infer<typeof PurchaseTicketsForSchema>

export interface PurchaseTicketsForResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const purchaseTicketsForCore = async (
  input: PurchaseTicketsFor,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<PurchaseTicketsForResult> => {
  const {
    recipient,
    ticketProxy,
    showId,
    tierIndex,
    quantity,
    paymentToken,
    value,
    chainId
  } = input

  try {
    const validatedInput = PurchaseTicketsForSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: TicketABI,
      address: ticketProxy as `0x${string}`,
      functionName: 'purchaseTicketsFor',
      args: [recipient, showId, tierIndex, quantity, paymentToken],
      value: paymentToken === NULL_ADDRESS ? BigInt(value ?? 0) : undefined,
      chainId
    })

    // Execute the contract interaction
    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: TicketABI as Abi,
        functionName: request.functionName,
        args: request.args ? [...request.args] : undefined,
        value: paymentToken === NULL_ADDRESS ? BigInt(value ?? 0) : undefined
      },
      options
    )

    return {
      hash: receipt.transactionHash,
      receipt
    }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const usePurchaseTicketsFor = (
  input: PurchaseTicketsFor,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<PurchaseTicketsForResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (contextChainId ?? input.chainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      purchaseTicketsForCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error purchasing tickets for recipient:', error)
    }
  })
}
