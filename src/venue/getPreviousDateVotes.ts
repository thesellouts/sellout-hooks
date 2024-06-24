import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const GetPreviousDateVoteSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetPreviousDateVoteInput = z.infer<typeof GetPreviousDateVoteSchema>

export const getPreviousDateVote = async (
  input: GetPreviousDateVoteInput,
  config: Config
) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getPreviousDateVote',
      args: [showId, user],
      chainId
    })
  } catch (error) {
    console.error('Error getting previous date vote:', error)
    throw new Error('Failed to fetch previous date vote')
  }
}

export const useGetPreviousDateVote = (
  input: GetPreviousDateVoteInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getPreviousDateVote', input.showId, input.user],
    queryFn: () => getPreviousDateVote(input, config),
    enabled: !!input.showId && !!input.user
  })
}
