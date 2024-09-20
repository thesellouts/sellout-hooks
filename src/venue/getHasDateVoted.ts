import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetHasDateVotedSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetHasDateVotedInput = z.infer<typeof GetHasDateVotedSchema>

export const getHasDateVoted = async (
  input: GetHasDateVotedInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getHasDateVoted',
      args: [showId, user]
    })
  } catch (error) {
    console.error('Error checking if user has date voted:', error)
    throw new Error('Failed to check if user has date voted')
  }
}

export const useGetHasDateVoted = (
  input: GetHasDateVotedInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getHasDateVoted', input.showId, input.user],
    queryFn: () => getHasDateVoted(input, contractInteractor),
    enabled: !!input.showId && !!input.user
  })
}
