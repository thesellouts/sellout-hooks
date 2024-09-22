import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { ShowVaultABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetShowPaymentTokenSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowPaymentTokenInput = z.infer<typeof GetShowPaymentTokenSchema>

const getShowPaymentTokenCore = async (
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

export const getShowPaymentToken = async (input: GetShowPaymentTokenInput) => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getShowPaymentTokenCore(input, contractInteractor)
}

export const useGetShowPaymentToken = (input: GetShowPaymentTokenInput) => {
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
