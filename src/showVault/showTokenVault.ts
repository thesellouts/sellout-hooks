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

const GetShowTokenVaultSchema = z.object({
  showId: z.string(),
  tokenAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowTokenVault = z.infer<typeof GetShowTokenVaultSchema>

export const getShowTokenVaultCore = async (
  input: GetShowTokenVault,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, tokenAddress, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return (await contractInteractor.read({
      address: addresses.ShowVault as `0x${string}`,
      abi: ShowVaultABI as Abi,
      functionName: 'showTokenVault',
      args: [showId, tokenAddress]
    })) as bigint
  } catch (error) {
    console.error('Error getting show token vault balance:', error)
    throw new Error('Failed to get show token vault balance')
  }
}

type UseGetShowTokenVaultOptions = Omit<
  UseQueryOptions<bigint, Error, bigint, [string, string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetShowTokenVault = (
  input: GetShowTokenVault,
  options?: UseGetShowTokenVaultOptions
): UseQueryResult<bigint, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getShowTokenVault', input.showId, input.tokenAddress],
    queryFn: () =>
      getShowTokenVaultCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.showId && !!input.tokenAddress
        : !!input.showId && !!input.tokenAddress,
    ...queryOptions
  })
}
