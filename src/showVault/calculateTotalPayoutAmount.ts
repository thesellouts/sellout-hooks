import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowVaultABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const CalculateTotalPayoutAmountSchema = z.object({
  showId: z.string(),
  paymentToken: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type CalculateTotalPayoutAmountInput = z.infer<
  typeof CalculateTotalPayoutAmountSchema
>

export const calculateTotalPayoutAmount = async (
  input: CalculateTotalPayoutAmountInput,
  contractInteractor: ContractInteractor
) => {
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

export const useCalculateTotalPayoutAmount = (
  input: CalculateTotalPayoutAmountInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['calculateTotalPayoutAmount', input.showId, input.paymentToken],
    queryFn: () => calculateTotalPayoutAmount(input, contractInteractor),
    enabled: !!input.showId && !!input.paymentToken
  })
}
