import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

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

export interface IsVenueRegisteredResult {
  isRegistered: boolean
}

export const isVenueRegisteredCore = async (
  input: IsVenueRegistered,
  contractInteractor: ContractInteractor
): Promise<IsVenueRegisteredResult> => {
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

    return { isRegistered: Boolean(isRegistered) }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const useIsVenueRegistered = (
  input: IsVenueRegistered
): UseQueryResult<IsVenueRegisteredResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const isVenueRegisteredMemoized = useMemo(
    () => (input: IsVenueRegistered) =>
      isVenueRegisteredCore(input, contractInteractor),
    [contractInteractor]
  )

  return useQuery({
    queryKey: ['isVenueRegistered', input.venueAddress],
    queryFn: () =>
      isVenueRegisteredMemoized({
        ...input,
        chainId: effectiveChainId
      }),
    enabled: !!input.venueAddress
  })
}
