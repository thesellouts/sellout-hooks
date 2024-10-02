import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../../contractInteractor'

const GetVenueSchema = z.object({
  venueAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetVenueInput = z.infer<typeof GetVenueSchema>

export interface GetVenueResult {
  venueData: any
}

export const getVenueCore = async (
  input: GetVenueInput,
  contractInteractor: ContractInteractor
): Promise<GetVenueResult> => {
  const { chainId, venueAddress } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = GetVenueSchema.parse(input)

    // Execute the contract interaction
    const venueData = await contractInteractor.read({
      address: addresses.VenueRegistry as `0x${string}`,
      abi: VenueRegistryABI as Abi,
      functionName: 'getVenue',
      args: [validatedInput.venueAddress]
    })

    return { venueData }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const useGetVenue = (
  input: GetVenueInput
): UseQueryResult<GetVenueResult, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const getVenueMemoized = useMemo(
    () => (input: GetVenueInput) => getVenueCore(input, contractInteractor),
    [contractInteractor]
  )

  return useQuery({
    queryKey: ['getVenue', input.venueAddress],
    queryFn: () =>
      getVenueMemoized({
        ...input,
        chainId: effectiveChainId
      }),
    enabled: !!input.venueAddress
  })
}
