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

const GetShowByIdSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowById = z.infer<typeof GetShowByIdSchema>

export const getShowByIdCore = async (
  input: GetShowById,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getShowById',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading show details:', error)
    throw new Error('Failed to fetch show details')
  }
}

type UseGetShowByIdOptions = Omit<
  UseQueryOptions<any, Error, any, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetShowById = (
  input: GetShowById,
  options?: UseGetShowByIdOptions
): UseQueryResult<any, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getShowById', input.showId],
    queryFn: () =>
      getShowByIdCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
