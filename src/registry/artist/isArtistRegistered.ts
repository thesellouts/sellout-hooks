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

const IsArtistRegisteredSchema = z.object({
  artistAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsArtistRegistered = z.infer<typeof IsArtistRegisteredSchema>

export const isArtistRegisteredCore = async (
  input: IsArtistRegistered,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { chainId, artistAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = IsArtistRegisteredSchema.parse(input)

  // Casting the response to boolean
  const result = await contractInteractor.read({
    abi: ArtistRegistryABI as Abi,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'isArtistRegistered',
    args: [validatedInput.artistAddress]
  })

  return Boolean(result) // Explicitly casting to boolean
}

export const useIsArtistRegistered = (
  input: IsArtistRegistered
): UseQueryResult<boolean, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['isArtistRegistered', input.artistAddress],
    queryFn: () =>
      isArtistRegisteredCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.artistAddress
  })
}
