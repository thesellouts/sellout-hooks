import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
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

export const getVenueCore = async (
  input: GetVenueInput,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { chainId, venueAddress } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = GetVenueSchema.parse(input)

    // Execute the contract interaction
    return await contractInteractor.read({
      address: addresses.VenueRegistry as `0x${string}`,
      abi: VenueRegistryABI as Abi,
      functionName: 'getVenue',
      args: [validatedInput.venueAddress]
    })
  } catch (err) {
    console.error('Error fetching venue data:', err)
    throw new Error('Failed to fetch venue data')
  }
}

type UseGetVenueOptions = Omit<
  UseQueryOptions<any, Error, any, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetVenue = (
  input: GetVenueInput,
  options?: UseGetVenueOptions
): UseQueryResult<any, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getVenue', input.venueAddress],
    queryFn: () =>
      getVenueCore({ ...input, chainId: effectiveChainId }, contractInteractor),
    enabled:
      enabled !== undefined
        ? enabled && !!input.venueAddress
        : !!input.venueAddress,
    ...queryOptions
  })
}
