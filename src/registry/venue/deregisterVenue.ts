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
import { getContractAddresses } from '../../config'

const DeregisterVenueSchema = z.object({
  venueId: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type DeregisterVenueInput = z.infer<typeof DeregisterVenueSchema>

export const deregisterVenue = async (
  input: DeregisterVenueInput,
  config: Config
) => {
  const { chainId, venueId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = DeregisterVenueSchema.parse(input)

  const { request } = await simulateContract(config, {
    abi: VenueRegistryABI,
    address: addresses.VenueRegistry as `0x${string}`,
    functionName: 'deregisterVenue',
    args: [validatedInput.venueId],
    chainId
  })

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useDeregisterVenue = (
  input: DeregisterVenueInput,
  config: Config
) => {
  return useMutation({
    mutationFn: () => deregisterVenue(input, config),
    onError: error => {
      console.error('Error deregistering venue:', error)
    }
  })
}
