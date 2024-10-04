import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { BoxOfficeABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetWalletTokenIdsSchema = z.object({
  showId: z.string(),
  address: z.string().optional(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetWalletTokenIds = z.infer<typeof GetWalletTokenIdsSchema>

export const getWalletTokenIdsCore = async (
  input: GetWalletTokenIds,
  contractInteractor: ContractInteractor
): Promise<bigint[]> => {
  const { chainId, showId, address } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint[]>({
      abi: BoxOfficeABI as Abi,
      address: addresses.BoxOffice as `0x${string}`,
      functionName: 'getWalletTokenIds',
      args: [showId, address]
    })
  } catch (err) {
    console.error('Error fetching wallet token IDs:', err)
    throw err
  }
}

type UseGetWalletTokenIdsOptions = Omit<
  UseQueryOptions<bigint[], Error, bigint[], [string, GetWalletTokenIds]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetWalletTokenIds = (
  input: GetWalletTokenIds,
  options?: UseGetWalletTokenIdsOptions
) => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getWalletTokenIds', input],
    queryFn: () =>
      getWalletTokenIdsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.showId && !!input.address
        : !!input.showId && !!input.address,
    ...queryOptions
  })
}
