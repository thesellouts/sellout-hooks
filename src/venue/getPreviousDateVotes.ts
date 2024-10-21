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

const GetPreviousDateVotesSchema = z.object({
  showId: z.string(),
  venueProxyAddress: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetPreviousDateVotes = z.infer<typeof GetPreviousDateVotesSchema>

export const getPreviousDateVoteCore = async (
  input: GetPreviousDateVotes,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, user, venueProxyAddress } = input

  try {
    return await contractInteractor.read<bigint>({
      address: venueProxyAddress as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getPreviousDateVote',
      args: [showId, user]
    })
  } catch (error) {
    console.error('Error getting previous date vote:', error)
    throw new Error('Failed to fetch previous date vote')
  }
}

type UseGetPreviousDateVoteOptions = Omit<
  UseQueryOptions<bigint, Error, bigint, [string, string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetPreviousDateVote = (
  input: GetPreviousDateVotes,
  options?: UseGetPreviousDateVoteOptions
): UseQueryResult<bigint, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getPreviousDateVote', input.showId, input.user],
    queryFn: () =>
      getPreviousDateVoteCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.showId && !!input.user
        : !!input.showId && !!input.user,
    ...queryOptions
  })
}
