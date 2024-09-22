import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../../contractInteractor'

const GetArtistSchema = z.object({
  artistAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetArtistInput = z.infer<typeof GetArtistSchema>

export const getArtistCore = async (
  input: GetArtistInput,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { chainId, artistAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetArtistSchema.parse(input)

  // Fetch the artist details from the contract
  const result = await contractInteractor.read({
    abi: ArtistRegistryABI as Abi,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'getArtist',
    args: [validatedInput.artistAddress]
  })

  return result
}

export const getArtist = async (input: GetArtistInput): Promise<any> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getArtistCore(input, contractInteractor)
}

export const useGetArtist = (
  input: GetArtistInput
): UseQueryResult<any, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
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
