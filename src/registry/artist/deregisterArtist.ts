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

const DeregisterArtistSchema = z.object({
  artistId: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type DeregisterArtistInput = z.infer<typeof DeregisterArtistSchema>

export const deregisterArtist = async (input: DeregisterArtistInput) => {
  const { chainId, artistId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = DeregisterArtistSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig, {
    abi: ArtistRegistryABI,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'deregisterArtist',
    args: [validatedInput.artistId],
    chainId
  })

  const hash = await writeContract(wagmiConfig, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(wagmiConfig, { hash })
  }
}

export const useDeregisterArtist = () => {
  return useMutation({
    mutationFn: (input: DeregisterArtistInput) => deregisterArtist(input),
    onError: error => {
      console.error('Error deregistering artist:', error)
    }
  })
}
