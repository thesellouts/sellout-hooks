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

const GetSelectedProposalIndexSchema = z.object({
  showId: z.string(),
  venueProxyAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetSelectedProposalIndex = z.infer<
  typeof GetSelectedProposalIndexSchema
>

export const getSelectedProposalIndexCore = async (
  input: GetSelectedProposalIndex,
  contractInteractor: ContractInteractor
): Promise<number> => {
  const { showId, venueProxyAddress } = input

  try {
    return await contractInteractor.read<number>({
      address: venueProxyAddress as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getSelectedProposalIndex',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting selected proposal index:', error)
    throw new Error('Failed to fetch selected proposal index')
  }
}

type UseGetSelectedProposalIndexOptions = Omit<
  UseQueryOptions<number, Error, number, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetSelectedProposalIndex = (
  input: GetSelectedProposalIndex,
  options?: UseGetSelectedProposalIndexOptions
): UseQueryResult<number, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getSelectedProposalIndex', input.showId],
    queryFn: () =>
      getSelectedProposalIndexCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
