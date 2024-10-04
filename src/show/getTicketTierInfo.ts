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

const GetTicketTierInfoSchema = z.object({
  showId: z.string(),
  tierIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetTicketTierInfo = z.infer<typeof GetTicketTierInfoSchema>

export const getTicketTierInfoCore = async (
  input: GetTicketTierInfo,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { showId, tierIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getTicketTierInfo',
      args: [showId, tierIndex]
    })
  } catch (error) {
    console.error('Error reading ticket tier info:', error)
    throw new Error('Failed to fetch ticket tier info')
  }
}

type UseGetTicketTierInfoOptions = Omit<
  UseQueryOptions<any, Error, any, [string, string, number]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetTicketTierInfo = (
  input: GetTicketTierInfo,
  options?: UseGetTicketTierInfoOptions
): UseQueryResult<any, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getTicketTierInfo', input.showId, input.tierIndex],
    queryFn: () =>
      getTicketTierInfoCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.showId && input.tierIndex !== undefined
        : !!input.showId && input.tierIndex !== undefined,
    ...queryOptions
  })
}
