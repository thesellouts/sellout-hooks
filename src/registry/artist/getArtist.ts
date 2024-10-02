import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../../contractInteractor'

const GetArtistSchema = z.object({
  artistAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetArtist = z.infer<typeof GetArtistSchema>

export const getArtistCore = async (
  input: GetArtist,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { chainId, artistAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetArtistSchema.parse(input)

  // Fetch the artist details from the contract
  return await contractInteractor.read({
    abi: ArtistRegistryABI as Abi,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'getArtist',
    args: [validatedInput.artistAddress]
  })
}

export const useGetArtist = (input: GetArtist): UseQueryResult<any, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getArtist', input.artistAddress],
    queryFn: () =>
      getArtistCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.artistAddress
  })
}
