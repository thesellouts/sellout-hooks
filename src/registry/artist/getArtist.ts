import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses, wagmiConfig } from '../../config'

const GetArtistSchema = z.object({
  artistAddress: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetArtistInput = z.infer<typeof GetArtistSchema>

export const getArtist = async (input: GetArtistInput) => {
  const { chainId, artistAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetArtistSchema.parse(input)

  return await readContract(wagmiConfig as unknown as Config, {
    abi: ArtistRegistryABI,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'getArtist',
    args: [validatedInput.artistAddress],
    chainId
  })
}

export const useGetArtist = (input: GetArtistInput) => {
  return useQuery({
    queryKey: ['getArtist', input.artistAddress],
    queryFn: () => getArtist(input),
    enabled: !!input.artistAddress
  })
}
