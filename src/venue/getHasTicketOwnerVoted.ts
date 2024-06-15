import { useQuery } from '@tanstack/react-query'
import { readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetHasTicketOwnerVotedSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetHasTicketOwnerVotedInput = z.infer<
  typeof GetHasTicketOwnerVotedSchema
>

export const getHasTicketOwnerVoted = async (
  input: GetHasTicketOwnerVotedInput
) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getHasTicketOwnerVoted',
      args: [showId, user],
      chainId
    })
  } catch (error) {
    console.error('Error checking if ticket owner has voted:', error)
    throw new Error('Failed to check if ticket owner has voted')
  }
}

export const useGetHasTicketOwnerVoted = (
  input: GetHasTicketOwnerVotedInput
) => {
  return useQuery({
    queryKey: ['getHasTicketOwnerVoted', input.showId, input.user],
    queryFn: () => getHasTicketOwnerVoted(input),
    enabled: !!input.showId && !!input.user
  })
}
