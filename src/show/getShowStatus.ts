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

const GetShowStatusSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowStatus = z.infer<typeof GetShowStatusSchema>

export const getShowStatusCore = async (
  input: GetShowStatus,
  contractInteractor: ContractInteractor
): Promise<number> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<number>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getShowStatus',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading show status:', error)
    throw new Error('Failed to fetch show status')
  }
}

type UseGetShowStatusOptions = Omit<
  UseQueryOptions<number, Error, number, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetShowStatus = (
  input: GetShowStatus,
  options?: UseGetShowStatusOptions
): UseQueryResult<number, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getShowStatus', input.showId],
    queryFn: () =>
      getShowStatusCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
