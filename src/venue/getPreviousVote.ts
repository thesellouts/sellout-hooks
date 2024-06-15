import { useQuery } from '@tanstack/react-query'
import { readContract } from '@wagmi/core'
import { sepolia, zora, zoraSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetPreviousVoteSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetPreviousVoteInput = z.infer<typeof GetPreviousVoteSchema>

export const getPreviousVote = async (input: GetPreviousVoteInput) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getPreviousVote',
      args: [showId, user],
      chainId
    })
  } catch (error) {
    console.error('Error getting previous vote:', error)
    throw new Error('Failed to fetch previous vote')
  }
}

export const useGetPreviousVote = (input: GetPreviousVoteInput) => {
  return useQuery({
    queryKey: ['getPreviousVote', input.showId, input.user],
    queryFn: () => getPreviousVote(input),
    enabled: !!input.showId && !!input.user
  })
}
