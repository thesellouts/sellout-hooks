import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const IsArtistRegisteredSchema = z.object({
  artistAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsArtistRegisteredInput = z.infer<typeof IsArtistRegisteredSchema>

export const isArtistRegistered = async (
  input: IsArtistRegisteredInput,
  contractInteractor: ContractInteractor
) => {
  const { chainId, artistAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = IsArtistRegisteredSchema.parse(input)

  return await contractInteractor.read({
    abi: ArtistRegistryABI as Abi,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'isArtistRegistered',
    args: [validatedInput.artistAddress]
  })
}

export const useIsArtistRegistered = (
  input: IsArtistRegisteredInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['isArtistRegistered', input.artistAddress],
    queryFn: () => isArtistRegistered(input, contractInteractor),
    enabled: !!input.artistAddress
  })
}
