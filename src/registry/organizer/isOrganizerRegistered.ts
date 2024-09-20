import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'
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
  contractInteractor: ContractInteractor
) => {
  const { chainId, organizerAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = IsOrganizerRegisteredSchema.parse(input)

  return await contractInteractor.read({
    abi: OrganizerRegistryABI as Abi,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'isOrganizerRegistered',
    args: [validatedInput.organizerAddress]
  })
}

export const useIsOrganizerRegistered = (
  input: IsOrganizerRegisteredInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['isOrganizerRegistered', input.organizerAddress],
    queryFn: () => isOrganizerRegistered(input, contractInteractor),
    enabled: !!input.organizerAddress
  })
}
