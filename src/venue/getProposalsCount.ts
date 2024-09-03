import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const GetProposalsCountSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetProposalsCountInput = z.infer<typeof GetProposalsCountSchema>

export const getProposalsCount = async (
  input: GetProposalsCountInput,
  config: Config
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
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

export const useGetProposalsCount = (
  input: GetProposalsCountInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getProposalsCount', input.showId],
    queryFn: () => getProposalsCount(input, config),
    enabled: !!input.showId
  })
}
