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

const GetPreviousVoteSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetPreviousVote = z.infer<typeof GetPreviousVoteSchema>

export const getPreviousVoteCore = async (
  input: GetPreviousVote,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getPreviousVote',
      args: [showId, user]
    })
  } catch (error) {
    console.error('Error getting previous vote:', error)
    throw new Error('Failed to fetch previous vote')
  }
}

type UseGetPreviousVoteOptions = Omit<
  UseQueryOptions<bigint, Error, bigint, [string, string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetPreviousVote = (
  input: GetPreviousVote,
  options?: UseGetPreviousVoteOptions
): UseQueryResult<bigint, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getPreviousVote', input.showId, input.user],
    queryFn: () =>
      getPreviousVoteCore(
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
