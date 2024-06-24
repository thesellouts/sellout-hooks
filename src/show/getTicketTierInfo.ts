import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetTicketTierInfoSchema = z.object({
  showId: z.string(),
  tierIndex: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetTicketTierInfoInput = z.infer<typeof GetTicketTierInfoSchema>

export const getTicketTierInfo = async (input: GetTicketTierInfoInput) => {
  const { showId, tierIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig as unknown as Config, {
      address: addresses.Show as `0x${string}`,
      abi: ShowABI,
      functionName: 'getTicketTierInfo',
      args: [showId, tierIndex],
      chainId
    })
  } catch (error) {
    console.error('Error reading ticket tier info:', error)
    throw new Error('Failed to fetch ticket tier info')
  }
}

export const useGetTicketTierInfo = (input: GetTicketTierInfoInput) => {
  return useQuery({
    queryKey: ['getTicketTierInfo', input.showId, input.tierIndex],
    queryFn: () => getTicketTierInfo(input),
    enabled: !!input.showId && input.tierIndex !== undefined
  })
}
