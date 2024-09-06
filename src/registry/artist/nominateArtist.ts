import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'

const NominateArtistSchema = z.object({
  nominee: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type NominateArtistInput = z.infer<typeof NominateArtistSchema>

export const nominateArtist = async (
  input: NominateArtistInput,
  config: Config
) => {
  const { chainId, nominee } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = NominateArtistSchema.parse(input)

  const { request } = await simulateContract(config, {
    abi: ArtistRegistryABI,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'nominate',
    args: [validatedInput.nominee],
    chainId
  })

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useNominateArtist = (
  input: NominateArtistInput,
  config: Config
) => {
  return useMutation({
    mutationFn: () => nominateArtist(input, config),
    onError: error => {
      console.error('Error nominating artist:', error)
    }
  })
}
