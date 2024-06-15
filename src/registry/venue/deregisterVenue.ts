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

const DeregisterVenueSchema = z.object({
  venueId: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type DeregisterVenueInput = z.infer<typeof DeregisterVenueSchema>

export const deregisterVenue = async (input: DeregisterVenueInput) => {
  const { chainId, venueId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = DeregisterVenueSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig, {
    abi: VenueRegistryABI,
    address: addresses.VenueRegistry as `0x${string}`,
    functionName: 'deregisterVenue',
    args: [validatedInput.venueId],
    chainId
  })

  const hash = await writeContract(wagmiConfig, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(wagmiConfig, { hash })
  }
}

export const useDeregisterVenue = () => {
  return useMutation({
    mutationFn: (input: DeregisterVenueInput) => deregisterVenue(input),
    onError: error => {
      console.error('Error deregistering venue:', error)
    }
  })
}
