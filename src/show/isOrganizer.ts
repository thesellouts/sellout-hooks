import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const IsOrganizerSchema = z.object({
  user: z.string(),
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type IsOrganizerInput = z.infer<typeof IsOrganizerSchema>

export const isOrganizer = async (input: IsOrganizerInput) => {
  const { user, showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig, {
      address: addresses.Show as `0x${string}`,
      abi: ShowABI,
      functionName: 'isOrganizer',
      args: [user, showId],
      chainId
    })
  } catch (error) {
    console.error('Error checking if user is an organizer:', error)
    throw new Error('Failed to check if user is an organizer')
  }
}

export const useIsOrganizer = (input: IsOrganizerInput) => {
  return useQuery({
    queryKey: ['isOrganizer', input.user, input.showId],
    queryFn: () => isOrganizer(input),
    enabled: !!input.user && !!input.showId
  })
}
