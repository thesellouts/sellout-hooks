import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses, wagmiConfig } from '../../config'

const NominateArtistSchema = z.object({
  nominee: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type NominateArtistInput = z.infer<typeof NominateArtistSchema>

export const nominateArtist = async (input: NominateArtistInput) => {
  const { chainId, nominee } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = NominateArtistSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig, {
    abi: ArtistRegistryABI,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'nominate',
    args: [validatedInput.nominee],
    chainId
  })

  const hash = await writeContract(wagmiConfig, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(wagmiConfig, { hash })
  }
}

export const useNominateArtist = () => {
  return useMutation({
    mutationFn: (input: NominateArtistInput) => nominateArtist(input),
    onError: error => {
      console.error('Error nominating artist:', error)
    }
  })
}
