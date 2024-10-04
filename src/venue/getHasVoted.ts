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

const GetHasVotedSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetHasVotedInput = z.infer<typeof GetHasVotedSchema>

export const getHasVotedCore = async (
  input: GetHasVotedInput,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<boolean>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getHasVoted',
      args: [showId, user]
    })
  } catch (error) {
    console.error('Error checking if user has voted:', error)
    throw new Error('Failed to check if user has voted')
  }
}

type UseGetHasVotedOptions = Omit<
  UseQueryOptions<boolean, Error, boolean, [string, string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetHasVoted = (
  input: GetHasVotedInput,
  options?: UseGetHasVotedOptions
): UseQueryResult<boolean, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getHasVoted', input.showId, input.user],
    queryFn: () =>
      getHasVotedCore(
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
