import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'

const GetVenueSchema = z.object({
  venueAddress: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetVenueInput = z.infer<typeof GetVenueSchema>

export const getVenue = async (input: GetVenueInput, config: Config) => {
  const { chainId, venueAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetVenueSchema.parse(input)

  return await readContract(config, {
    abi: VenueRegistryABI,
    address: addresses.VenueRegistry as `0x${string}`,
    functionName: 'getVenue',
    args: [validatedInput.venueAddress],
    chainId
  })
}

export const useGetVenue = (input: GetVenueInput, config: Config) => {
  return useQuery({
    queryKey: ['getVenue', input.venueAddress],
    queryFn: () => getVenue(input, config),
    enabled: !!input.venueAddress
  })
}
