import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const VoteSchema = z.object({
  showId: z.string(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type Vote = z.infer<typeof VoteSchema>

export interface VoteResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createVote =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: Vote): Promise<VoteResult> => {
    const { showId, proposalIndex, chainId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = VoteSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: VenueABI,
        address: addresses.Venue as `0x${string}`,
        functionName: 'vote',
        args: [showId, proposalIndex],
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

export const useVote = (
  input: Vote,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<VoteResult, Error> => {
  const vote = useMemo(
    () => createVote(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => vote(input),
    onError: error => {
      console.error('Error executing vote:', error)
    }
  })
}
