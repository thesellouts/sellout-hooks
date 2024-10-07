import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const RefundBribeSchema = z.object({
  showId: z.string(),
  venueId: z.number(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type RefundBribe = z.infer<typeof RefundBribeSchema>

export interface RefundBribeResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const refundBribeCore = async (
  input: RefundBribe,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<RefundBribeResult> => {
  const { showId, venueId, proposalIndex, chainId } = input
  const addresses = getContractAddresses(chainId)
  const account =
    options?.smart !== false
      ? contractInteractor.smartAccountAddress
      : undefined

  try {
    const validatedInput = RefundBribeSchema.parse(input)

    const { request } = await simulateContract(config, {
      abi: ShowABI as Abi,
      address: addresses.Show as `0x${string}`,
      functionName: 'refundBribe',
      args: [
        validatedInput.showId,
        validatedInput.venueId,
        validatedInput.proposalIndex
      ],
      chainId,
      account
    })

    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: ShowABI as Abi,
        functionName: request.functionName,
        args: request.args ? [...request.args] : undefined
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

export const useRefundBribe = (
  input: RefundBribe,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<RefundBribeResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () => {
      if (effectiveChainId !== base.id && effectiveChainId !== baseSepolia.id) {
        throw new Error(`Unsupported chain ID: ${effectiveChainId}`)
      }
      return refundBribeCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      )
    },
    onError: error => {
      console.error('Error refunding bribe:', error)
    }
  })
}
