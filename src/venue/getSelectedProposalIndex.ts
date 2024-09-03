import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const GetSelectedProposalIndexSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetSelectedProposalIndexInput = z.infer<
  typeof GetSelectedProposalIndexSchema
>

export const getSelectedProposalIndex = async (
  input: GetSelectedProposalIndexInput,
  config: Config
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getSelectedProposalIndex',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error getting selected proposal index:', error)
    throw new Error('Failed to fetch selected proposal index')
  }
}

export const useGetSelectedProposalIndex = (
  input: GetSelectedProposalIndexInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getSelectedProposalIndex', input.showId],
    queryFn: () => getSelectedProposalIndex(input, config),
    enabled: !!input.showId
  })
}
