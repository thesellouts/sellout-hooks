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

const CalculateTotalPayoutAmountSchema = z.object({
  showId: z.string(),
  paymentToken: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type CalculateTotalPayoutAmount = z.infer<
  typeof CalculateTotalPayoutAmountSchema
>

export const calculateTotalPayoutAmountCore = async (
  input: CalculateTotalPayoutAmount,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, paymentToken, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.ShowVault as `0x${string}`,
      abi: ShowVaultABI as Abi,
      functionName: 'calculateTotalPayoutAmount',
      args: [showId, paymentToken]
    })
  } catch (error) {
    console.error('Error calculating total payout amount:', error)
    throw new Error('Failed to calculate total payout amount')
  }
}

type UseCalculateTotalPayoutAmountOptions = Omit<
  UseQueryOptions<bigint, Error, bigint, [string, string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useCalculateTotalPayoutAmount = (
  input: CalculateTotalPayoutAmount,
  options?: UseCalculateTotalPayoutAmountOptions
): UseQueryResult<bigint, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['calculateTotalPayoutAmount', input.showId, input.paymentToken],
    queryFn: () =>
      calculateTotalPayoutAmountCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.showId && !!input.paymentToken
        : !!input.showId && !!input.paymentToken,
    ...queryOptions
  })
}
