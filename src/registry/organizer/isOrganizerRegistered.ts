import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
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
import { AddressSchema } from '../../utils'

const IsOrganizerRegisteredSchema = z.object({
  organizerAddress: AddressSchema,
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsOrganizerRegistered = z.infer<typeof IsOrganizerRegisteredSchema>

export const isOrganizerRegisteredCore = async (
  input: IsOrganizerRegistered,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { chainId, organizerAddress } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = IsOrganizerRegisteredSchema.parse(input)

    // Execute the contract interaction using read
    const result = await contractInteractor.read({
      abi: OrganizerRegistryABI as Abi,
      address: addresses.OrganizerRegistry as `0x${string}`,
      functionName: 'isOrganizerRegistered',
      args: [validatedInput.organizerAddress]
    })

    return Boolean(result)
  } catch (err) {
    console.error('Error checking if organizer is registered:', err)
    throw new Error('Failed to check if organizer is registered')
  }
}

type UseIsOrganizerRegisteredOptions = Omit<
  UseQueryOptions<boolean, Error, boolean, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useIsOrganizerRegistered = (
  input: IsOrganizerRegistered,
  options?: UseIsOrganizerRegisteredOptions
): UseQueryResult<boolean, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['isOrganizerRegistered', input.organizerAddress],
    queryFn: () =>
      isOrganizerRegisteredCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.organizerAddress
        : !!input.organizerAddress,
    ...queryOptions
  })
}
