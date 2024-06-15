import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses, wagmiConfig } from '../../config'

const UpdateVenueSchema = z.object({
  venueId: z.number(),
  name: z.string(),
  bio: z.string(),
  wallet: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  totalCapacity: z.number(),
  streetAddress: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>

export const updateVenue = async (input: UpdateVenueInput) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = UpdateVenueSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig, {
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

  const hash = await writeContract(wagmiConfig, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(wagmiConfig, { hash })
  }
}

export const useUpdateVenue = () => {
  return useMutation({
    mutationFn: (input: UpdateVenueInput) => updateVenue(input),
    onError: error => {
      console.error('Error updating venue:', error)
    }
  })
}
