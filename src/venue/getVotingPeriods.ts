import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetVotingPeriodsSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetVotingPeriodsInput = z.infer<typeof GetVotingPeriodsSchema>

export const getVotingPeriods = async (input: GetVotingPeriodsInput) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig as unknown as Config, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getVotingPeriods',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error getting voting periods:', error)
    throw new Error('Failed to fetch voting periods')
  }
}

export const useGetVotingPeriods = (input: GetVotingPeriodsInput) => {
  return useQuery({
    queryKey: ['getVotingPeriods', input.showId],
    queryFn: () => getVotingPeriods(input),
    enabled: !!input.showId
  })
}
