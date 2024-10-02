import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../../contractInteractor'

const GetOrganizerSchema = z.object({
  organizerAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetOrganizer = z.infer<typeof GetOrganizerSchema>

export const getOrganizerCore = async (
  input: GetOrganizer,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { chainId, organizerAddress } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = GetOrganizerSchema.parse(input)

    // Execute the contract interaction using read
    return await contractInteractor.read({
      abi: OrganizerRegistryABI as Abi,
      address: addresses.OrganizerRegistry as `0x${string}`,
      functionName: 'getOrganizer',
      args: [validatedInput.organizerAddress]
    })
  } catch (err) {
    console.error('Error fetching organizer data:', err)
    throw new Error('Failed to fetch organizer data')
  }
}

export const useGetOrganizer = (
  input: GetOrganizer
): UseQueryResult<any, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getOrganizer', input.organizerAddress],
    queryFn: () =>
      getOrganizerCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.organizerAddress
  })
}
