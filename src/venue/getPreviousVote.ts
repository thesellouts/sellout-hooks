import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetPreviousVoteSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetPreviousVoteInput = z.infer<typeof GetPreviousVoteSchema>

export const getPreviousVote = async (
  input: GetPreviousVoteInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getPreviousVote',
      args: [showId, user]
    })
  } catch (error) {
    console.error('Error getting previous vote:', error)
    throw new Error('Failed to fetch previous vote')
  }
}

export const useGetPreviousVote = (
  input: GetPreviousVoteInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getPreviousVote', input.showId, input.user],
    queryFn: () => getPreviousVote(input, contractInteractor),
    enabled: !!input.showId && !!input.user
  })
}
