import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const IsOrganizerSchema = z.object({
  user: z.string(),
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsOrganizerInput = z.infer<typeof IsOrganizerSchema>

export const isOrganizerCore = async (
  input: IsOrganizerInput,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { user, showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<boolean>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'isOrganizer',
      args: [user, showId]
    })
  } catch (error) {
    console.error('Error checking if user is an organizer:', error)
    throw new Error('Failed to check if user is an organizer')
  }
}

type UseIsOrganizerOptions = Omit<
  UseQueryOptions<boolean, Error, boolean, [string, string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useIsOrganizer = (
  input: IsOrganizerInput,
  options?: UseIsOrganizerOptions
): UseQueryResult<boolean, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['isOrganizer', input.user, input.showId],
    queryFn: () =>
      isOrganizerCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.user && !!input.showId
        : !!input.user && !!input.showId,
    ...queryOptions
  })
}
