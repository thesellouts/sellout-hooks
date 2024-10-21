import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
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
  venueProxyAddress: z.string(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetProposal = z.infer<typeof GetProposalSchema>

export const getProposalCore = async (
  input: GetProposal,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { showId, proposalIndex, venueProxyAddress } = input

  try {
    return await contractInteractor.read<any>({
      address: venueProxyAddress as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getProposal',
      args: [showId, proposalIndex]
    })
  } catch (error) {
    console.error('Error getting proposal:', error)
    throw new Error('Failed to fetch proposal')
  }
}

type UseGetProposalOptions = Omit<
  UseQueryOptions<any, Error, any, [string, string, number]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetProposal = (
  input: GetProposal,
  options?: UseGetProposalOptions
): UseQueryResult<any, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getProposal', input.showId, input.proposalIndex],
    queryFn: () =>
      getProposalCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.showId && input.proposalIndex >= 0
        : !!input.showId && input.proposalIndex >= 0,
    ...queryOptions
  })
}
