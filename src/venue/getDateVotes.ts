import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetDateVotesSchema = z.object({
  showId: z.string(),
  date: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetDateVotesInput = z.infer<typeof GetDateVotesSchema>

export const getDateVotes = async (
  input: GetDateVotesInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, date, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getDateVotes',
      args: [showId, date]
    })
  } catch (error) {
    console.error('Error getting date votes:', error)
    throw new Error('Failed to fetch date votes')
  }
}

export const useGetDateVotes = (
  input: GetDateVotesInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getDateVotes', input.showId, input.date],
    queryFn: () => getDateVotes(input, contractInteractor),
    enabled: !!input.showId && !!input.date
  })
}
