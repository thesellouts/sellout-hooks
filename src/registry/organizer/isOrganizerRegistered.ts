import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../../contractInteractor'
import { AddressSchema } from '../../utils'

const IsOrganizerRegisteredSchema = z.object({
  organizerAddress: AddressSchema,
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsOrganizerRegistered = z.infer<
  typeof IsOrganizerRegisteredSchema
>

export const isOrganizerRegisteredCore = async (
  input: IsOrganizerRegistered,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { chainId, organizerAddress } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = IsOrganizerRegisteredSchema.parse(input)

    // Execute the contract interaction using read
    return await contractInteractor.read({
      abi: OrganizerRegistryABI as Abi,
      address: addresses.OrganizerRegistry as `0x${string}`,
      functionName: 'isOrganizerRegistered',
      args: [validatedInput.organizerAddress]
    })
  } catch (err) {
    console.error('Error checking if organizer is registered:', err)
    throw new Error('Failed to check if organizer is registered')
  }
}

export const isOrganizerRegistered = async (
  input: IsOrganizerRegistered
): Promise<boolean> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return isOrganizerRegisteredCore(input, contractInteractor)
}

export const useIsOrganizerRegistered = (
  input: IsOrganizerRegistered
): UseQueryResult<boolean, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['isOrganizerRegistered', input.organizerAddress],
    queryFn: () =>
      isOrganizerRegisteredCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.organizerAddress
  })
}
