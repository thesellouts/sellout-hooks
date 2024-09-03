import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'

const GetShowOrganizerSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowOrganizerInput = z.infer<typeof GetShowOrganizerSchema>

export const getShowOrganizer = async (
  input: GetShowOrganizerInput,
  config: Config
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
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

export const useGetShowOrganizer = (
  input: GetShowOrganizerInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getOrganizer', input.showId],
    queryFn: () => getShowOrganizer(input, config),
    enabled: !!input.showId
  })
}
