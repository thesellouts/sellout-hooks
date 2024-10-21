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
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetDateVotesSchema = z.object({
  venueProxyAddress: z.string(),
  showId: z.string(),
  date: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetDateVotes = z.infer<typeof GetDateVotesSchema>

export const getDateVotesCore = async (
  input: GetDateVotes,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, date, venueProxyAddress } = input

  try {
    return await contractInteractor.read<bigint>({
      address: venueProxyAddress as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getDateVotes',
      args: [showId, date]
    })
  } catch (error) {
    console.error('Error getting date votes:', error)
    throw new Error('Failed to fetch date votes')
  }
}

type UseGetDateVotesOptions = Omit<
  UseQueryOptions<bigint, Error, bigint, [string, string, number]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetDateVotes = (
  input: GetDateVotes,
  options?: UseGetDateVotesOptions
): UseQueryResult<bigint, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getDateVotes', input.showId, input.date],
    queryFn: () =>
      getDateVotesCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.showId && !!input.date
        : !!input.showId && !!input.date,
    ...queryOptions
  })
}
