import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const GetPreviousVoteSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetPreviousVoteInput = z.infer<typeof GetPreviousVoteSchema>

export const getPreviousVote = async (
  input: GetPreviousVoteInput,
  config: Config
) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
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

export const useGetPreviousVote = (
  input: GetPreviousVoteInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getPreviousVote', input.showId, input.user],
    queryFn: () => getPreviousVote(input, config),
    enabled: !!input.showId && !!input.user
  })
}
