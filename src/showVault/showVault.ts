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

const GetShowVaultSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowVault = z.infer<typeof GetShowVaultSchema>

export const getShowVaultCore = async (
  input: GetShowVault,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return (await contractInteractor.read({
      address: addresses.ShowVault as `0x${string}`,
      abi: ShowVaultABI as Abi,
      functionName: 'showVault',
      args: [showId]
    })) as bigint
  } catch (error) {
    console.error('Error getting show vault balance:', error)
    throw new Error('Failed to get show vault balance')
  }
}

type UseGetShowVaultOptions = Omit<
  UseQueryOptions<bigint, Error, bigint, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetShowVault = (
  input: GetShowVault,
  options?: UseGetShowVaultOptions
): UseQueryResult<bigint, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getShowVault', input.showId],
    queryFn: () =>
      getShowVaultCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
