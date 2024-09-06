import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const GetHasDateVotedSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetHasDateVotedInput = z.infer<typeof GetHasDateVotedSchema>

export const getHasDateVoted = async (
  input: GetHasDateVotedInput,
  config: Config
) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getHasDateVoted',
      args: [showId, user],
      chainId
    })
  } catch (error) {
    console.error('Error checking if user has date voted:', error)
    throw new Error('Failed to check if user has date voted')
  }
}

export const useGetHasDateVoted = (
  input: GetHasDateVotedInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getHasDateVoted', input.showId, input.user],
    queryFn: () => getHasDateVoted(input, config),
    enabled: !!input.showId && !!input.user
  })
}
