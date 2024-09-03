import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowVaultABI } from '../abis'
import { getContractAddresses } from '../config'

const CalculateTotalPayoutAmountSchema = z.object({
  showId: z.string(),
  paymentToken: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type CalculateTotalPayoutAmountInput = z.infer<
  typeof CalculateTotalPayoutAmountSchema
>

export const calculateTotalPayoutAmount = async (
  input: CalculateTotalPayoutAmountInput,
  config: Config
) => {
  const { showId, paymentToken, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.ShowVault as `0x${string}`,
      abi: ShowVaultABI,
      functionName: 'calculateTotalPayoutAmount',
      args: [showId, paymentToken],
      chainId
    })
  } catch (error) {
    console.error('Error calculating total payout amount:', error)
    throw new Error('Failed to calculate total payout amount')
  }
}

export const useCalculateTotalPayoutAmount = (
  input: CalculateTotalPayoutAmountInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['calculateTotalPayoutAmount', input.showId, input.paymentToken],
    queryFn: () => calculateTotalPayoutAmount(input, config),
    enabled: !!input.showId && !!input.paymentToken
  })
}
