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

const GetShowToVenueProxySchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowToVenueProxy = z.infer<typeof GetShowToVenueProxySchema>

export const getShowToVenueProxyCore = async (
  input: GetShowToVenueProxy,
  contractInteractor: ContractInteractor
): Promise<`0x${string}`> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<`0x${string}`>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getShowToVenueProxy',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading venue proxy:', error)
    throw new Error('Failed to fetch venue proxy')
  }
}

type UseGetShowToVenueProxyOptions = Omit<
  UseQueryOptions<`0x${string}`, Error, `0x${string}`, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetShowToVenueProxy = (
  input: GetShowToVenueProxy,
  options?: UseGetShowToVenueProxyOptions
): UseQueryResult<`0x${string}`, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getShowToVenueProxy', input.showId],
    queryFn: () =>
      getShowToVenueProxyCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
