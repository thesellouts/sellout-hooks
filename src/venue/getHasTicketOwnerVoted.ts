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

const GetHasTicketOwnerVotedSchema = z.object({
  showId: z.string(),
  venueProxyAddress: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetHasTicketOwnerVoted = z.infer<
  typeof GetHasTicketOwnerVotedSchema
>

export const getHasTicketOwnerVotedCore = async (
  input: GetHasTicketOwnerVoted,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { showId, user, venueProxyAddress } = input

  try {
    return await contractInteractor.read<boolean>({
      address: venueProxyAddress as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getHasTicketOwnerVoted',
      args: [showId, user]
    })
  } catch (error) {
    console.error('Error checking if ticket owner has voted:', error)
    throw new Error('Failed to check if ticket owner has voted')
  }
}

type UseGetHasTicketOwnerVotedOptions = Omit<
  UseQueryOptions<boolean, Error, boolean, [string, string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetHasTicketOwnerVoted = (
  input: GetHasTicketOwnerVoted,
  options?: UseGetHasTicketOwnerVotedOptions
): UseQueryResult<boolean, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getHasTicketOwnerVoted', input.showId, input.user],
    queryFn: () =>
      getHasTicketOwnerVotedCore(
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
