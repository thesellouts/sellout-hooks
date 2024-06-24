import { useQuery } from '@tanstack/react-query'
import { readContract } from '@wagmi/core'
import { sepolia, zora, zoraSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetSelectedDateSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetSelectedDateInput = z.infer<typeof GetSelectedDateSchema>

export const getSelectedDate = async (input: GetSelectedDateInput) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig as unknown as Config, {
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

export const useGetSelectedDate = (input: GetSelectedDateInput) => {
  return useQuery({
    queryKey: ['getSelectedDate', input.showId],
    queryFn: () => getSelectedDate(input),
    enabled: !!input.showId
  })
}
