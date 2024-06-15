import { useQuery } from '@tanstack/react-query'
import { readContract } from '@wagmi/core'
import { sepolia, zora, zoraSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetProposalsCountSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetProposalsCountInput = z.infer<typeof GetProposalsCountSchema>

export const getProposalsCount = async (input: GetProposalsCountInput) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getProposalsCount',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error getting proposals count:', error)
    throw new Error('Failed to fetch proposals count')
  }
}

export const useGetProposalsCount = (input: GetProposalsCountInput) => {
  return useQuery({
    queryKey: ['getProposalsCount', input.showId],
    queryFn: () => getProposalsCount(input),
    enabled: !!input.showId
  })
}
