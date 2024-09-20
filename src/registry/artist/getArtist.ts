import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const GetArtistSchema = z.object({
  artistAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetArtistInput = z.infer<typeof GetArtistSchema>

export const getArtist = async (
  input: GetArtistInput,
  contractInteractor: ContractInteractor
) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetArtistSchema.parse(input)

  return await contractInteractor.read({
    abi: ArtistRegistryABI as Abi,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'getArtist',
    args: [validatedInput.artistAddress]
  })
}

export const useGetArtist = (
  input: GetArtistInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getArtist', input.artistAddress],
    queryFn: () => getArtist(input, contractInteractor),
    enabled: !!input.artistAddress
  })
}
