import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetProposalSchema = z.object({
  showId: z.string(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetProposal = z.infer<typeof GetProposalSchema>

export const getProposalCore = async (
  input: GetProposal,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { showId, proposalIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<any>({
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

export const useGetProposal = (input: GetProposal) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getProposal', input.showId, input.proposalIndex],
    queryFn: () =>
      getProposalCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && input.proposalIndex >= 0
  })
}
