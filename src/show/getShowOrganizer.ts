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

const GetShowOrganizerSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowOrganizer = z.infer<typeof GetShowOrganizerSchema>

export const getShowOrganizerCore = async (
  input: GetShowOrganizer,
  contractInteractor: ContractInteractor
): Promise<string> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<string>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getOrganizer',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading organizer:', error)
    throw new Error('Failed to fetch organizer')
  }
}

type UseGetShowOrganizerOptions = Omit<
  UseQueryOptions<string, Error, string, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetShowOrganizer = (
  input: GetShowOrganizer,
  options?: UseGetShowOrganizerOptions
): UseQueryResult<string, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getOrganizer', input.showId],
    queryFn: () =>
      getShowOrganizerCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
