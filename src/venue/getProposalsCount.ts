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

const GetProposalsCountSchema = z.object({
  showId: z.string(),
  venueProxyAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetProposalsCount = z.infer<typeof GetProposalsCountSchema>

export const getProposalsCountCore = async (
  input: GetProposalsCount,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, venueProxyAddress } = input

  try {
    return await contractInteractor.read<bigint>({
      address: venueProxyAddress as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getProposalsCount',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting proposals count:', error)
    throw new Error('Failed to fetch proposals count')
  }
}

type UseGetProposalsCountOptions = Omit<
  UseQueryOptions<bigint, Error, bigint, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetProposalsCount = (
  input: GetProposalsCount,
  options?: UseGetProposalsCountOptions
): UseQueryResult<bigint, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getProposalsCount', input.showId],
    queryFn: () =>
      getProposalsCountCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
