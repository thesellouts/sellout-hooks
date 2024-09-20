import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowVaultABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetShowTokenVaultSchema = z.object({
  showId: z.string(),
  tokenAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowTokenVaultInput = z.infer<typeof GetShowTokenVaultSchema>

export const getShowTokenVault = async (
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

// Hook to use the show token vault balance function
export const useGetShowTokenVault = (
  input: GetShowTokenVaultInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getShowTokenVault', input.showId, input.tokenAddress],
    queryFn: () => getShowTokenVault(input, contractInteractor),
    enabled: !!input.showId && !!input.tokenAddress
  })
}
