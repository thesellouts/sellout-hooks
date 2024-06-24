import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetShowOrganizerSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetShowOrganizerInput = z.infer<typeof GetShowOrganizerSchema>

export const getShowOrganizer = async (input: GetShowOrganizerInput) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig as unknown as Config, {
      address: addresses.Show as `0x${string}`,
      abi: ShowABI,
      functionName: 'getOrganizer',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error reading organizer:', error)
    throw new Error('Failed to fetch organizer')
  }
}

export const useGetShowOrganizer = (input: GetShowOrganizerInput) => {
  return useQuery({
    queryKey: ['getOrganizer', input.showId],
    queryFn: () => getShowOrganizer(input),
    enabled: !!input.showId
  })
}
