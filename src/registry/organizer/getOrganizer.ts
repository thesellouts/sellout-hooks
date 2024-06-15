import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses, wagmiConfig } from '../../config'

const GetOrganizerSchema = z.object({
  organizerAddress: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetOrganizerInput = z.infer<typeof GetOrganizerSchema>

export const getOrganizer = async (input: GetOrganizerInput) => {
  const { chainId, organizerAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetOrganizerSchema.parse(input)

  return await readContract(wagmiConfig, {
    abi: OrganizerRegistryABI,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'getOrganizer',
    args: [validatedInput.organizerAddress],
    chainId
  })
}

export const useGetOrganizer = (input: GetOrganizerInput) => {
  return useQuery({
    queryKey: ['getOrganizer', input.organizerAddress],
    queryFn: () => getOrganizer(input),
    enabled: !!input.organizerAddress
  })
}
