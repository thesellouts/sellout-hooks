import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetNumberOfVotersSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetNumberOfVotersInput = z.infer<typeof GetNumberOfVotersSchema>

export const getNumberOfVoters = async (input: GetNumberOfVotersInput) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig, {
      address: addresses.Show as `0x${string}`,
      abi: ShowABI,
      functionName: 'getNumberOfVoters',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error reading number of voters:', error)
    throw new Error('Failed to fetch number of voters')
  }
}

export const useGetNumberOfVoters = (input: GetNumberOfVotersInput) => {
  return useQuery({
    queryKey: ['getNumberOfVoters', input.showId],
    queryFn: () => getNumberOfVoters(input),
    enabled: !!input.showId
  })
}
