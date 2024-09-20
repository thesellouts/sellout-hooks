import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const GetOrganizerSchema = z.object({
  organizerAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetOrganizerInput = z.infer<typeof GetOrganizerSchema>

export const getOrganizer = async (
  input: GetOrganizerInput,
  contractInteractor: ContractInteractor
) => {
  const { chainId, organizerAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetOrganizerSchema.parse(input)

  return await contractInteractor.read({
    abi: OrganizerRegistryABI as Abi,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'getOrganizer',
    args: [validatedInput.organizerAddress]
  })
}

export const useGetOrganizer = (
  input: GetOrganizerInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getOrganizer', input.organizerAddress],
    queryFn: () => getOrganizer(input, contractInteractor),
    enabled: !!input.organizerAddress
  })
}
