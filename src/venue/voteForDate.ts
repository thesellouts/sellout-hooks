import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const VoteForDateSchema = z.object({
  showId: z.string(),
  dateIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type VoteForDate = z.infer<typeof VoteForDateSchema>

export interface VoteForDateResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const voteForDateCore = async (
  input: VoteForDate,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<VoteForDateResult> => {
  const { showId, dateIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = VoteForDateSchema.parse(input)
    const account =
      options?.smart !== false
        ? contractInteractor.smartAccountAddress
        : undefined

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: VenueABI,
      address: addresses.Venue as `0x${string}`,
      functionName: 'voteForDate',
      args: [showId, dateIndex],
      chainId,
      account
    })

    // Execute the contract interaction
    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: VenueABI as Abi,
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

export const useVoteForDate = (
  input: VoteForDate,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<VoteForDateResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      voteForDateCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error executing voteForDate:', error)
    }
  })
}
