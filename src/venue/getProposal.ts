import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const GetProposalSchema = z.object({
  showId: z.string(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetProposalInput = z.infer<typeof GetProposalSchema>

export const getProposal = async (input: GetProposalInput, config: Config) => {
  const { showId, proposalIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getProposal',
      args: [showId, proposalIndex],
      chainId
    })
  } catch (error) {
    console.error('Error getting proposal:', error)
    throw new Error('Failed to fetch proposal')
  }
}

export const useGetProposal = (input: GetProposalInput, config: Config) => {
  return useQuery({
    queryKey: ['getProposal', input.showId, input.proposalIndex],
    queryFn: () => getProposal(input, config),
    enabled: !!input.showId && input.proposalIndex >= 0
  })
}
