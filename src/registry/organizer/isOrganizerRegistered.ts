import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { AddressSchema } from '../../utils'

const IsOrganizerRegisteredSchema = z.object({
  organizerAddress: AddressSchema,
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsOrganizerRegisteredInput = z.infer<
  typeof IsOrganizerRegisteredSchema
>

export const isOrganizerRegistered = async (
  input: IsOrganizerRegisteredInput,
  config: Config
) => {
  const { chainId, organizerAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = IsOrganizerRegisteredSchema.parse(input)

  return await readContract(config, {
    abi: OrganizerRegistryABI,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'isOrganizerRegistered',
    args: [validatedInput.organizerAddress],
    chainId
  })
}

export const useIsOrganizerRegistered = (
  input: IsOrganizerRegisteredInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['isOrganizerRegistered', input.organizerAddress],
    queryFn: () => isOrganizerRegistered(input, config),
    enabled: !!input.organizerAddress
  })
}
