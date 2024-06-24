import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora, zoraSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetRefundsSchema = z.object({
  user: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetRefundsInput = z.infer<typeof GetRefundsSchema>

export const getRefunds = async (input: GetRefundsInput) => {
  const { user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig as unknown as Config, {
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

export const useGetRefunds = (input: GetRefundsInput) => {
  return useQuery({
    queryKey: ['getRefunds', input.user],
    queryFn: () => getRefunds(input),
    enabled: !!input.user
  })
}
