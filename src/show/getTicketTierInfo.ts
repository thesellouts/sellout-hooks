import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'

const GetTicketTierInfoSchema = z.object({
  showId: z.string(),
  tierIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetTicketTierInfoInput = z.infer<typeof GetTicketTierInfoSchema>

export const getTicketTierInfo = async (
  input: GetTicketTierInfoInput,
  config: Config
) => {
  const { showId, tierIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
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

export const useGetTicketTierInfo = (
  input: GetTicketTierInfoInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getTicketTierInfo', input.showId, input.tierIndex],
    queryFn: () => getTicketTierInfo(input, config),
    enabled: !!input.showId && input.tierIndex !== undefined
  })
}
