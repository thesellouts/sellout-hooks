import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ShowVaultABI } from '../abis'
import { getContractAddresses } from '../config'

const GetShowTokenVaultSchema = z.object({
  showId: z.string(),
  tokenAddress: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetShowTokenVaultInput = z.infer<typeof GetShowTokenVaultSchema>

// Function to get the show token vault balance
export const getShowTokenVault = async (
  input: GetShowTokenVaultInput,
  config: Config
): Promise<bigint> => {
  const { showId, tokenAddress, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return (await readContract(config, {
      address: addresses.ShowVault as `0x${string}`,
      abi: ShowVaultABI,
      functionName: 'showTokenVault',
      args: [showId, tokenAddress],
      chainId
    })) as bigint
  } catch (error) {
    console.error('Error getting show token vault balance:', error)
    throw new Error('Failed to get show token vault balance')
  }
}

// Hook to use the show token vault balance function
export const useGetShowTokenVault = (
  input: GetShowTokenVaultInput,
  config: Config,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: ['getShowTokenVault', input.showId, input.tokenAddress],
    queryFn: () => getShowTokenVault(input, config),
    enabled: !!input.showId && !!input.tokenAddress && enabled
  })
}
