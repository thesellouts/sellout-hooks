import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ShowVaultABI } from '../abis'
import { getContractAddresses } from '../config'

const GetShowPaymentTokenSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowPaymentTokenInput = z.infer<typeof GetShowPaymentTokenSchema>

export const getShowPaymentToken = async (
  input: GetShowPaymentTokenInput,
  config: Config
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.ShowVault as `0x${string}`,
      abi: ShowVaultABI,
      functionName: 'getShowPaymentToken',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error getting show payment token:', error)
    throw new Error('Failed to get show payment token')
  }
}

export const useGetShowPaymentToken = (
  input: GetShowPaymentTokenInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getShowPaymentToken', input.showId],
    queryFn: () => getShowPaymentToken(input, config),
    enabled: !!input.showId
  })
}
