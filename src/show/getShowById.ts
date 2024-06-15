import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetShowByIdSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetShowByIdInput = z.infer<typeof GetShowByIdSchema>

export const getShowById = async (input: GetShowByIdInput) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig, {
      address: addresses.Show as `0x${string}`,
      abi: ShowABI,
      functionName: 'getShowById',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error reading show details:', error)
    throw new Error('Failed to fetch show details')
  }
}

export const useGetShowById = (input: GetShowByIdInput) => {
  return useQuery({
    queryKey: ['getShowById', input.showId],
    queryFn: () => getShowById(input),
    enabled: !!input.showId
  })
}
