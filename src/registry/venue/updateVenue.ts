import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'

const UpdateVenueSchema = z.object({
  venueId: z.number(),
  name: z.string(),
  bio: z.string(),
  wallet: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  totalCapacity: z.number(),
  streetAddress: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>

export const updateVenue = async (input: UpdateVenueInput, config: Config) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = UpdateVenueSchema.parse(input)

  const { request } = await simulateContract(config, {
    abi: VenueRegistryABI,
    address: addresses.VenueRegistry as `0x${string}`,
    functionName: 'updateVenue',
    args: [
      validatedInput.venueId,
      validatedInput.name,
      validatedInput.bio,
      validatedInput.wallet,
      validatedInput.latitude,
      validatedInput.longitude,
      validatedInput.totalCapacity,
      validatedInput.streetAddress
    ],
    chainId
  })

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useUpdateVenue = (input: UpdateVenueInput, config: Config) => {
  return useMutation({
    mutationFn: () => updateVenue(input, config),
    onError: error => {
      console.error('Error updating venue:', error)
    }
  })
}
