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
import { getContractAddresses } from '../../config'

const UpdateArtistSchema = z.object({
  artistId: z.number(),
  name: z.string(),
  bio: z.string(),
  wallet: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type UpdateArtistInput = z.infer<typeof UpdateArtistSchema>

export const updateArtist = async (
  input: UpdateArtistInput,
  config: Config
) => {
  const { chainId, artistId, name, bio, wallet } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = UpdateArtistSchema.parse(input)

  const { request } = await simulateContract(config, {
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

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useUpdateArtist = (input: UpdateArtistInput, config: Config) => {
  return useMutation({
    mutationFn: () => updateArtist(input, config),
    onError: error => {
      console.error('Error updating artist:', error)
    }
  })
}
