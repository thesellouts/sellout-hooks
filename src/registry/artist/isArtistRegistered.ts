import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
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

  const result = await contractInteractor.read({
    abi: ArtistRegistryABI as Abi,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'isArtistRegistered',
    args: [validatedInput.artistAddress]
  })

  return Boolean(result)
}

type UseIsArtistRegisteredOptions = Omit<
  UseQueryOptions<boolean, Error, boolean, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useIsArtistRegistered = (
  input: IsArtistRegistered,
  options?: UseIsArtistRegisteredOptions
): UseQueryResult<boolean, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['isArtistRegistered', input.artistAddress],
    queryFn: () =>
      isArtistRegisteredCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.artistAddress
        : !!input.artistAddress,
    ...queryOptions
  })
}
