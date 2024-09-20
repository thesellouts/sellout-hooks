import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowVaultABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetShowPaymentTokenSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowPaymentTokenInput = z.infer<typeof GetShowPaymentTokenSchema>

export const getShowPaymentToken = async (
  input: GetShowPaymentTokenInput,
  contractInteractor: ContractInteractor
) => {
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

export const useGetShowPaymentToken = (
  input: GetShowPaymentTokenInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getShowPaymentToken', input.showId],
    queryFn: () => getShowPaymentToken(input, contractInteractor),
    enabled: !!input.showId
  })
}
