import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'

const IsArtistSchema = z.object({
  user: z.string(),
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsArtistInput = z.infer<typeof IsArtistSchema>

export const isArtist = async (input: IsArtistInput, config: Config) => {
  const { user, showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.Show as `0x${string}`,
      abi: ShowABI,
      functionName: 'isArtist',
      args: [user, showId],
      chainId
    })
  } catch (error) {
    console.error('Error checking if user is an artist:', error)
    throw new Error('Failed to check if user is an artist')
  }
}

export const useIsArtist = (input: IsArtistInput, config: Config) => {
  return useQuery({
    queryKey: ['isArtist', input.user, input.showId],
    queryFn: () => isArtist(input, config),
    enabled: !!input.user && !!input.showId
  })
}
