import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'

const NominateVenueSchema = z.object({
  nominee: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type NominateVenueInput = z.infer<typeof NominateVenueSchema>

export const nominateVenue = async (
  input: NominateVenueInput,
  config: Config
) => {
  const { chainId, nominee } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = NominateVenueSchema.parse(input)

  const { request } = await simulateContract(config, {
    abi: VenueRegistryABI,
    address: addresses.VenueRegistry as `0x${string}`,
    functionName: 'nominate',
    args: [validatedInput.nominee],
    chainId
  })

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useNominateVenue = (input: NominateVenueInput, config: Config) => {
  return useMutation({
    mutationFn: () => nominateVenue(input, config),
    onError: error => {
      console.error('Error nominating venue:', error)
    }
  })
}
