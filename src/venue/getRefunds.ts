import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const GetRefundsSchema = z.object({
  user: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetRefundsInput = z.infer<typeof GetRefundsSchema>

export const getRefunds = async (input: GetRefundsInput, config: Config) => {
  const { user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getRefunds',
      args: [user],
      chainId
    })
  } catch (error) {
    console.error('Error getting refunds:', error)
    throw new Error('Failed to fetch refunds')
  }
}

export const useGetRefunds = (input: GetRefundsInput, config: Config) => {
  return useQuery({
    queryKey: ['getRefunds', input.user],
    queryFn: () => getRefunds(input, config),
    enabled: !!input.user
  })
}
