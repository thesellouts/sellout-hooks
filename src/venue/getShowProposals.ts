import { useQuery } from '@tanstack/react-query'
import { readContract } from '@wagmi/core'
import { sepolia, zora, zoraSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetShowProposalsSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetShowProposalsInput = z.infer<typeof GetShowProposalsSchema>

export const getShowProposals = async (input: GetShowProposalsInput) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig as unknown as Config, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getShowProposals',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error getting show proposals:', error)
    throw new Error('Failed to fetch show proposals')
  }
}

export const useGetShowProposals = (input: GetShowProposalsInput) => {
  return useQuery({
    queryKey: ['getShowProposals', input.showId],
    queryFn: () => getShowProposals(input),
    enabled: !!input.showId
  })
}
