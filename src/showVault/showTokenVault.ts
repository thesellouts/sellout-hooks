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

const GetShowTokenVaultSchema = z.object({
  showId: z.string(),
  tokenAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowTokenVaultInput = z.infer<typeof GetShowTokenVaultSchema>

export const getShowTokenVaultCore = async (
  input: GetShowTokenVaultInput,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, tokenAddress, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return (await contractInteractor.read({
      address: addresses.ShowVault as `0x${string}`,
      abi: ShowVaultABI as Abi,
      functionName: 'showTokenVault',
      args: [showId, tokenAddress]
    })) as bigint
  } catch (error) {
    console.error('Error getting show token vault balance:', error)
    throw new Error('Failed to get show token vault balance')
  }
}

export const getShowTokenVault = async (
  input: GetShowTokenVaultInput
): Promise<bigint> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getShowTokenVaultCore(input, contractInteractor)
}

export const useGetShowTokenVault = (input: GetShowTokenVaultInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getShowTokenVault', input.showId, input.tokenAddress],
    queryFn: () =>
      getShowTokenVaultCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && !!input.tokenAddress
  })
}
