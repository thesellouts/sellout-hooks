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

const AcceptNominationSchema = z.object({
  name: z.string(),
  bio: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  totalCapacity: z.number(),
  streetAddress: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type AcceptVenueNominationInput = z.infer<typeof AcceptNominationSchema>

export const acceptVenueNomination = async (
  input: AcceptVenueNominationInput
) => {
  const {
    chainId,
    name,
    bio,
    latitude,
    longitude,
    totalCapacity,
    streetAddress
  } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = AcceptNominationSchema.parse(input)

  console.log('VA', validatedInput, chainId)
  const { request } = await simulateContract(wagmiConfig as unknown as Config, {
    abi: VenueRegistryABI,
    address: addresses.VenueRegistry as `0x${string}`,
    functionName: 'acceptNomination',
    args: [
      validatedInput.name,
      validatedInput.bio,
      validatedInput.latitude,
      validatedInput.longitude,
      validatedInput.totalCapacity,
      validatedInput.streetAddress
    ],
    chainId
  })

  const hash = await writeContract(wagmiConfig as unknown as Config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(wagmiConfig as unknown as Config, { hash })
  }
}

export const useAcceptVenueNomination = () => {
  return useMutation({
    mutationFn: (input: AcceptVenueNominationInput) =>
      acceptVenueNomination(input),
    onError: error => {
      console.error('Error accepting nomination:', error)
    }
  })
}
