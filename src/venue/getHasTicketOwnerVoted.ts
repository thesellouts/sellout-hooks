import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetHasTicketOwnerVotedSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetHasTicketOwnerVotedInput = z.infer<
  typeof GetHasTicketOwnerVotedSchema
>

export const getHasTicketOwnerVoted = async (
  input: GetHasTicketOwnerVotedInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getHasTicketOwnerVoted',
      args: [showId, user]
    })
  } catch (error) {
    console.error('Error checking if ticket owner has voted:', error)
    throw new Error('Failed to check if ticket owner has voted')
  }
}

export const useGetHasTicketOwnerVoted = (
  input: GetHasTicketOwnerVotedInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getHasTicketOwnerVoted', input.showId, input.user],
    queryFn: () => getHasTicketOwnerVoted(input, contractInteractor),
    enabled: !!input.showId && !!input.user
  })
}
