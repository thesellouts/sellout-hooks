import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ShowVaultABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetShowVaultSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetShowVaultInput = z.infer<typeof GetShowVaultSchema>

export const getShowVault = async (
  input: GetShowVaultInput
): Promise<bigint> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return (await readContract(wagmiConfig, {
      address: addresses.ShowVault as `0x${string}`,
      abi: ShowVaultABI,
      functionName: 'showVault',
      args: [showId],
      chainId
    })) as bigint
  } catch (error) {
    console.error('Error getting show vault balance:', error)
    throw new Error('Failed to get show vault balance')
  }
}

export const useGetShowVault = (
  input: GetShowVaultInput,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['getShowVault', input.showId],
    queryFn: () => getShowVault(input),
    enabled: !!input.showId && enabled
  })
}
