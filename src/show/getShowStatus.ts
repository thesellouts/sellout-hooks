import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'

const GetShowStatusSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowStatusInput = z.infer<typeof GetShowStatusSchema>

export const getShowStatus = async (
  input: GetShowStatusInput,
  config: Config
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.Show as `0x${string}`,
      abi: ShowABI,
      functionName: 'getShowStatus',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error reading show status:', error)
    throw new Error('Failed to fetch show status')
  }
}

export const useGetShowStatus = (input: GetShowStatusInput, config: Config) => {
  return useQuery({
    queryKey: ['getShowStatus', input.showId],
    queryFn: () => getShowStatus(input, config),
    enabled: !!input.showId
  })
}
