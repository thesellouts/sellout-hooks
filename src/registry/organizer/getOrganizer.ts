import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'

const GetOrganizerSchema = z.object({
  organizerAddress: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetOrganizerInput = z.infer<typeof GetOrganizerSchema>

export const getOrganizer = async (
  input: GetOrganizerInput,
  config: Config
) => {
  const { chainId, organizerAddress } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetOrganizerSchema.parse(input)

  return await readContract(config, {
    abi: OrganizerRegistryABI,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'getOrganizer',
    args: [validatedInput.organizerAddress],
    chainId
  })
}

export const useGetOrganizer = (input: GetOrganizerInput, config: Config) => {
  return useQuery({
    queryKey: ['getOrganizer', input.organizerAddress],
    queryFn: () => getOrganizer(input, config),
    enabled: !!input.organizerAddress
  })
}
