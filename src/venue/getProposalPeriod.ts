import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const GetProposalPeriodSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetProposalPeriodInput = z.infer<typeof GetProposalPeriodSchema>

export const getProposalPeriod = async (
  input: GetProposalPeriodInput,
  config: Config
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getProposalPeriod',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error getting proposal period:', error)
    throw new Error('Failed to fetch proposal period')
  }
}

export const useGetProposalPeriod = (
  input: GetProposalPeriodInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getProposalPeriod', input.showId],
    queryFn: () => getProposalPeriod(input, config),
    enabled: !!input.showId
  })
}
