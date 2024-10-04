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

const GetShowProposalsSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowProposals = z.infer<typeof GetShowProposalsSchema>

export const getShowProposalsCore = async (
  input: GetShowProposals,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<any>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getShowProposals',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting show proposals:', error)
    throw new Error('Failed to fetch show proposals')
  }
}

type UseGetShowProposalsOptions = Omit<
  UseQueryOptions<any, Error, any, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetShowProposals = (
  input: GetShowProposals,
  options?: UseGetShowProposalsOptions
): UseQueryResult<any, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getShowProposals', input.showId],
    queryFn: () =>
      getShowProposalsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
