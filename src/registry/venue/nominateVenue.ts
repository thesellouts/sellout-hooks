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

const NominateVenueSchema = z.object({
  nominee: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type NominateVenueInput = z.infer<typeof NominateVenueSchema>

export const nominateVenue = async (input: NominateVenueInput) => {
  const { chainId, nominee } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = NominateVenueSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig, {
    abi: VenueRegistryABI,
    address: addresses.VenueRegistry as `0x${string}`,
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

export const useNominateVenue = () => {
  return useMutation({
    mutationFn: (input: NominateVenueInput) => nominateVenue(input),
    onError: error => {
      console.error('Error nominating venue:', error)
    }
  })
}
