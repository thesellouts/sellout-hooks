import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'

const IsVenueRegisteredSchema = z.object({
  venueAddress: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type IsVenueRegisteredInput = z.infer<typeof IsVenueRegisteredSchema>

export const isVenueRegistered = async (
  input: IsVenueRegisteredInput,
  config: Config
) => {
  const { chainId, venueAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = IsVenueRegisteredSchema.parse(input)

  return await readContract(config, {
    abi: VenueRegistryABI,
    address: addresses.VenueRegistry as `0x${string}`,
    functionName: 'isVenueRegistered',
    args: [validatedInput.venueAddress],
    chainId
  })
}

export const useIsVenueRegistered = (
  input: IsVenueRegisteredInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['isVenueRegistered', input.venueAddress],
    queryFn: () => isVenueRegistered(input, config),
    enabled: !!input.venueAddress
  })
}
