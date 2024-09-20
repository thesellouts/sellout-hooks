import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetProposalSchema = z.object({
  showId: z.string(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetProposalInput = z.infer<typeof GetProposalSchema>

export const getProposal = async (
  input: GetProposalInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, proposalIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getProposal',
      args: [showId, proposalIndex]
    })
  } catch (error) {
    console.error('Error getting proposal:', error)
    throw new Error('Failed to fetch proposal')
  }
}

export const useGetProposal = (
  input: GetProposalInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getProposal', input.showId, input.proposalIndex],
    queryFn: () => getProposal(input, contractInteractor),
    enabled: !!input.showId && input.proposalIndex >= 0
  })
}
