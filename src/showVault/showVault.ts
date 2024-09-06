import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia, sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ShowVaultABI } from '../abis'
import { getContractAddresses } from '../config'

const GetShowVaultSchema = z.object({
  showId: z.string(),
  chainId: z.union([
    z.literal(base.id),
    z.literal(baseSepolia.id)
  ])
})

export type GetShowVaultInput = z.infer<typeof GetShowVaultSchema>

export const getShowVault = async (
  input: GetShowVaultInput,
  config: Config
): Promise<bigint> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return (await readContract(config, {
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
  config: Config,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['getShowVault', input.showId],
    queryFn: () => getShowVault(input, config),
    enabled: !!input.showId && enabled
  })
}
