import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora, zoraSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const VoteSchema = z.object({
  showId: z.string(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type Vote = z.infer<typeof VoteSchema>

export const vote = async (input: Vote, config: Config) => {
  const { showId, proposalIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = VoteSchema.parse(input)

    const { request } = await simulateContract(config, {
      abi: VenueABI,
      address: addresses.Venue as `0x${string}`,
      functionName: 'vote',
      args: [showId, proposalIndex],
      chainId
    })

    const hash = await writeContract(config, request)
    return {
      hash,
      getReceipt: () => waitForTransactionReceipt(config, { hash })
    }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const useVote = (input: Vote, config: Config) => {
  return useMutation({
    mutationFn: () => vote(input, config),
    onError: error => {
      console.error('Error executing vote:', error)
    }
  })
}
