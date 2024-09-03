import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const GetSelectedDateSchema = z.object({
  showId: z.string(),
  chainId: z.union([
    z.literal(sepolia.id),
    z.literal(zora.id),
    z.literal(base.id),
    z.literal(baseSepolia.id)
  ])
})

export type GetSelectedDateInput = z.infer<typeof GetSelectedDateSchema>

export const getSelectedDate = async (
  input: GetSelectedDateInput,
  config: Config
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI,
      functionName: 'getSelectedDate',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error getting selected date:', error)
    throw new Error('Failed to fetch selected date')
  }
}

export const useGetSelectedDate = (
  input: GetSelectedDateInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getSelectedDate', input.showId],
    queryFn: () => getSelectedDate(input, config),
    enabled: !!input.showId
  })
}
