import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { ShowVaultABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetShowPaymentTokenSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowPaymentToken = z.infer<typeof GetShowPaymentTokenSchema>

export const getShowPaymentTokenCore = async (
  input: GetShowPaymentToken,
  contractInteractor: ContractInteractor
): Promise<string> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.ShowVault as `0x${string}`,
      abi: ShowVaultABI as Abi,
      functionName: 'getShowPaymentToken',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting show payment token:', error)
    throw new Error('Failed to get show payment token')
  }
}

type UseGetShowPaymentTokenOptions = Omit<
  UseQueryOptions<string, Error, string, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetShowPaymentToken = (
  input: GetShowPaymentToken,
  options?: UseGetShowPaymentTokenOptions
): UseQueryResult<string, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getShowPaymentToken', input.showId],
    queryFn: () =>
      getShowPaymentTokenCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
