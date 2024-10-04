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

const GetSelectedDateSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetSelectedDate = z.infer<typeof GetSelectedDateSchema>

export const getSelectedDateCore = async (
  input: GetSelectedDate,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getSelectedDate',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting selected date:', error)
    throw new Error('Failed to fetch selected date')
  }
}

type UseGetSelectedDateOptions = Omit<
  UseQueryOptions<bigint, Error, bigint, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetSelectedDate = (
  input: GetSelectedDate,
  options?: UseGetSelectedDateOptions
): UseQueryResult<bigint, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getSelectedDate', input.showId],
    queryFn: () =>
      getSelectedDateCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
