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

const UpdateArtistSchema = z.object({
  artistId: z.number(),
  name: z.string(),
  bio: z.string(),
  wallet: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type UpdateArtistInput = z.infer<typeof UpdateArtistSchema>

export const updateArtist = async (input: UpdateArtistInput) => {
  const { chainId, artistId, name, bio, wallet } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = UpdateArtistSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig, {
    abi: ArtistRegistryABI,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'updateArtist',
    args: [
      validatedInput.artistId,
      validatedInput.name,
      validatedInput.bio,
      validatedInput.wallet
    ],
    chainId
  })

  const hash = await writeContract(wagmiConfig, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(wagmiConfig, { hash })
  }
}

export const useUpdateArtist = () => {
  return useMutation({
    mutationFn: (input: UpdateArtistInput) => updateArtist(input),
    onError: error => {
      console.error('Error updating artist:', error)
    }
  })
}
