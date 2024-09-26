import { useQuery } from '@tanstack/react-query'
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
  input: CalculateTotalPayoutAmount
) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['calculateTotalPayoutAmount', input.showId, input.paymentToken],
    queryFn: () =>
      calculateTotalPayoutAmountCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && !!input.paymentToken
  })
}
