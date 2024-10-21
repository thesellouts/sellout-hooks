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

const GetRefundsSchema = z.object({
  user: z.string(),
  venueProxyAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetRefunds = z.infer<typeof GetRefundsSchema>

export const getRefundsCore = async (
  input: GetRefunds,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { user, venueProxyAddress } = input

  try {
    return await contractInteractor.read<any>({
      address: venueProxyAddress as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getRefunds',
      args: [user]
    })
  } catch (error) {
    console.error('Error getting refunds:', error)
    throw new Error('Failed to fetch refunds')
  }
}

type UseGetRefundsOptions = Omit<
  UseQueryOptions<any, Error, any, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetRefunds = (
  input: GetRefunds,
  options?: UseGetRefundsOptions
): UseQueryResult<any, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getRefunds', input.user],
    queryFn: () =>
      getRefundsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.user : !!input.user,
    ...queryOptions
  })
}
