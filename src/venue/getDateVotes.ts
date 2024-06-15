import { useQuery } from '@tanstack/react-query'
import { readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetDateVotesSchema = z.object({
  showId: z.string(),
  date: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetDateVotesInput = z.infer<typeof GetDateVotesSchema>

export const getDateVotes = async (input: GetDateVotesInput) => {
  const { showId, date, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getDateVotes',
      args: [showId, date],
      chainId
    })
  } catch (error) {
    console.error('Error getting date votes:', error)
    throw new Error('Failed to fetch date votes')
  }
}

export const useGetDateVotes = (input: GetDateVotesInput) => {
  return useQuery({
    queryKey: ['getDateVotes', input.showId, input.date],
    queryFn: () => getDateVotes(input),
    enabled: !!input.showId && !!input.date
  })
}
