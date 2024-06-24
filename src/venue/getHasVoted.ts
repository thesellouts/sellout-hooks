import { useQuery } from '@tanstack/react-query'
import { readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetHasVotedSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetHasVotedInput = z.infer<typeof GetHasVotedSchema>

export const getHasVoted = async (input: GetHasVotedInput) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig as unknown as Config, {
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

export const useGetHasVoted = (input: GetHasVotedInput) => {
  return useQuery({
    queryKey: ['getHasVoted', input.showId, input.user],
    queryFn: () => getHasVoted(input),
    enabled: !!input.showId && !!input.user
  })
}
