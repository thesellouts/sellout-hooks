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

const GetShowPaymentTokenSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowPaymentToken = z.infer<typeof GetShowPaymentTokenSchema>

export const getShowPaymentTokenCore = async (
  input: GetShowPaymentToken,
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

export const useGetShowPaymentToken = (input: GetShowPaymentToken) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getShowPaymentToken', input.showId],
    queryFn: () =>
      getShowPaymentTokenCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId
  })
}
