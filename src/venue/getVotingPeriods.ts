import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetVotingPeriodsSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetVotingPeriodsInput = z.infer<typeof GetVotingPeriodsSchema>

export const getVotingPeriods = async (
  input: GetVotingPeriodsInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getVotingPeriods',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting voting periods:', error)
    throw new Error('Failed to fetch voting periods')
  }
}

export const useGetVotingPeriods = (
  input: GetVotingPeriodsInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getVotingPeriods', input.showId],
    queryFn: () => getVotingPeriods(input, contractInteractor),
    enabled: !!input.showId
  })
}
