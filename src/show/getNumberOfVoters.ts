import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'

const GetNumberOfVotersSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetNumberOfVotersInput = z.infer<typeof GetNumberOfVotersSchema>

export const getNumberOfVoters = async (
  input: GetNumberOfVotersInput,
  config: Config
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
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

export const useGetNumberOfVoters = (
  input: GetNumberOfVotersInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getNumberOfVoters', input.showId],
    queryFn: () => getNumberOfVoters(input, config),
    enabled: !!input.showId
  })
}
