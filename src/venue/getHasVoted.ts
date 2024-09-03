import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const GetHasVotedSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetHasVotedInput = z.infer<typeof GetHasVotedSchema>

export const getHasVoted = async (input: GetHasVotedInput, config: Config) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getHasVoted',
      args: [showId, user],
      chainId
    })
  } catch (error) {
    console.error('Error checking if user has voted:', error)
    throw new Error('Failed to check if user has voted')
  }
}

export const useGetHasVoted = (input: GetHasVotedInput, config: Config) => {
  return useQuery({
    queryKey: ['getHasVoted', input.showId, input.user],
    queryFn: () => getHasVoted(input, config),
    enabled: !!input.showId && !!input.user
  })
}
