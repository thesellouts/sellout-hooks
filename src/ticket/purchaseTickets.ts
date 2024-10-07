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

const PurchaseTicketsSchema = z.object({
  ticketProxy: AddressSchema,
  showId: z.string(),
  tierIndex: z.number(),
  quantity: z.number(),
  paymentToken: AddressSchema,
  value: z.bigint().optional(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type PurchaseTickets = z.infer<typeof PurchaseTicketsSchema>

export interface PurchaseTicketsResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const purchaseTicketsCore = async (
  input: PurchaseTickets,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<PurchaseTicketsResult> => {
  try {
    const validatedInput = PurchaseTicketsSchema.parse(input)
    const account =
      options?.smart !== false
        ? contractInteractor.smartAccountAddress
        : undefined

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: TicketABI,
      address: validatedInput.ticketProxy as `0x${string}`,
      functionName: 'purchaseTickets',
      args: [
        validatedInput.showId,
        validatedInput.tierIndex,
        validatedInput.quantity,
        validatedInput.paymentToken
      ],
      value:
        validatedInput.paymentToken === NULL_ADDRESS
          ? BigInt(validatedInput.value ?? 0)
          : undefined,
      chainId: validatedInput.chainId,
      account
    })

    // Execute the contract interaction
    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: TicketABI as Abi,
        functionName: request.functionName,
        args: request.args ? [...request.args] : undefined,
        value:
          validatedInput.paymentToken === NULL_ADDRESS
            ? BigInt(validatedInput.value ?? 0)
            : undefined
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

export const usePurchaseTickets = (
  input: PurchaseTickets,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<PurchaseTicketsResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      purchaseTicketsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error purchasing tickets:', error)
    }
  })
}
