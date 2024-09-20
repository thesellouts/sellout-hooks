import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetHasVotedSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetHasVotedInput = z.infer<typeof GetHasVotedSchema>

export const getHasVoted = async (
  input: GetHasVotedInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getHasVoted',
      args: [showId, user]
    })
  } catch (error) {
    console.error('Error checking if user has voted:', error)
    throw new Error('Failed to check if user has voted')
  }
}

export const useGetHasVoted = (
  input: GetHasVotedInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getHasVoted', input.showId, input.user],
    queryFn: () => getHasVoted(input, contractInteractor),
    enabled: !!input.showId && !!input.user
  })
}
