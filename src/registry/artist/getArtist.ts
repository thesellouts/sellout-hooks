import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'

const GetArtistSchema = z.object({
  artistAddress: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetArtistInput = z.infer<typeof GetArtistSchema>

export const getArtist = async (input: GetArtistInput, config: Config) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetArtistSchema.parse(input)

  return await readContract(config, {
    abi: ArtistRegistryABI,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'getArtist',
    args: [validatedInput.artistAddress],
    chainId
  })
}

export const useGetArtist = (input: GetArtistInput, config: Config) => {
  return useQuery({
    queryKey: ['getArtist', input.artistAddress],
    queryFn: () => getArtist(input, config),
    enabled: !!input.artistAddress
  })
}
