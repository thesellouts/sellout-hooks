import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
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
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const voteForDateCore = async (
  input: VoteForDate,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<VoteForDateResult> => {
  const { showId, dateIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = VoteForDateSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: VenueABI,
      address: addresses.Venue as `0x${string}`,
      functionName: 'voteForDate',
      args: [showId, dateIndex],
      chainId
    })

    // Execute the contract interaction
    const receipt = await contractInteractor.execute({
      address: request.address,
      abi: VenueABI as Abi,
      functionName: request.functionName,
      args: request.args ? [...request.args] : undefined
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

export const voteForDate = async (
  input: VoteForDate
): Promise<VoteForDateResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return voteForDateCore(input, contractInteractor, config)
}

export const useVoteForDate = (
  input: VoteForDate
): UseMutationResult<VoteForDateResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

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
