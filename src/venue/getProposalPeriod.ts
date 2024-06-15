import { useQuery } from '@tanstack/react-query'
import { readContract } from '@wagmi/core'
import { sepolia, zora, zoraSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetProposalPeriodSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetProposalPeriodInput = z.infer<typeof GetProposalPeriodSchema>

export const getProposalPeriod = async (input: GetProposalPeriodInput) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig, {
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

export const useGetProposalPeriod = (input: GetProposalPeriodInput) => {
  return useQuery({
    queryKey: ['getProposalPeriod', input.showId],
    queryFn: () => getProposalPeriod(input),
    enabled: !!input.showId
  })
}
