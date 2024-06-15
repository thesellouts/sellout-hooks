import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses, wagmiConfig } from '../../config'
import { AddressSchema } from '../../utils'

const IsOrganizerRegisteredSchema = z.object({
  organizerAddress: AddressSchema,
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type IsOrganizerRegisteredInput = z.infer<
  typeof IsOrganizerRegisteredSchema
>

export const isOrganizerRegistered = async (
  input: IsOrganizerRegisteredInput
) => {
  const { chainId, organizerAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = IsOrganizerRegisteredSchema.parse(input)

  return await readContract(wagmiConfig, {
    abi: OrganizerRegistryABI,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'isOrganizerRegistered',
    args: [validatedInput.organizerAddress],
    chainId
  })
}

export const useIsOrganizerRegistered = (input: IsOrganizerRegisteredInput) => {
  return useQuery({
    queryKey: ['isOrganizerRegistered', input.organizerAddress],
    queryFn: () => isOrganizerRegistered(input),
    enabled: !!input.organizerAddress
  })
}
