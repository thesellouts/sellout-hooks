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

const GetProposalPeriodSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetProposalPeriod = z.infer<typeof GetProposalPeriodSchema>

export const getProposalPeriodCore = async (
  input: GetProposalPeriod,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getProposalPeriod',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting proposal period:', error)
    throw new Error('Failed to fetch proposal period')
  }
}

type UseGetProposalPeriodOptions = Omit<
  UseQueryOptions<bigint, Error, bigint, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetProposalPeriod = (
  input: GetProposalPeriod,
  options?: UseGetProposalPeriodOptions
): UseQueryResult<bigint, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getProposalPeriod', input.showId],
    queryFn: () =>
      getProposalPeriodCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
