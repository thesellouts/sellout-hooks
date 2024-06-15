import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses, wagmiConfig } from '../../config'

const IsArtistRegisteredSchema = z.object({
  artistAddress: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type IsArtistRegisteredInput = z.infer<typeof IsArtistRegisteredSchema>

export const isArtistRegistered = async (input: IsArtistRegisteredInput) => {
  const { chainId, artistAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = IsArtistRegisteredSchema.parse(input)

  return await readContract(wagmiConfig, {
    abi: ArtistRegistryABI,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'isArtistRegistered',
    args: [validatedInput.artistAddress],
    chainId
  })
}

export const useIsArtistRegistered = (input: IsArtistRegisteredInput) => {
  return useQuery({
    queryKey: ['isArtistRegistered', input.artistAddress],
    queryFn: () => isArtistRegistered(input),
    enabled: !!input.artistAddress
  })
}
