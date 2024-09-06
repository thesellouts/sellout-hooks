import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

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
  config: Config
) => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
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
  input: GetHasTicketOwnerVotedInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getHasTicketOwnerVoted', input.showId, input.user],
    queryFn: () => getHasTicketOwnerVoted(input, config),
    enabled: !!input.showId && !!input.user
  })
}
