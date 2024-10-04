import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { boolean, z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../../contractInteractor'

const IsVenueRegisteredSchema = z.object({
  venueAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsVenueRegistered = z.infer<typeof IsVenueRegisteredSchema>

export const isVenueRegisteredCore = async (
  input: IsVenueRegistered,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { chainId, venueAddress } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = IsVenueRegisteredSchema.parse(input)

    // Execute the contract interaction
    const isRegistered = await contractInteractor.read({
      address: addresses.VenueRegistry as `0x${string}`,
      abi: VenueRegistryABI as Abi,
      functionName: 'isVenueRegistered',
      args: [validatedInput.venueAddress]
    })

    return Boolean(isRegistered)
  } catch (err) {
    console.error('Error checking if venue is registered:', err)
    throw new Error('Failed to check if venue is registered')
  }
}

type UseIsVenueRegisteredOptions = Omit<
  UseQueryOptions<boolean, Error, boolean, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useIsVenueRegistered = (
  input: IsVenueRegistered,
  options?: UseIsVenueRegisteredOptions
): UseQueryResult<boolean, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['isVenueRegistered', input.venueAddress],
    queryFn: () =>
      isVenueRegisteredCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.venueAddress
        : !!input.venueAddress,
    ...queryOptions
  })
}
