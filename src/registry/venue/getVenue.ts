import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Config } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const GetVenueSchema = z.object({
  venueAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetVenueInput = z.infer<typeof GetVenueSchema>

export interface GetVenueResult {
  venueData: any // Update this type according to the expected return data
}

const createGetVenue =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: GetVenueInput): Promise<GetVenueResult> => {
    const { chainId, venueAddress } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = GetVenueSchema.parse(input)

      // Execute the contract interaction using readContract
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
  input: GetVenueInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseQueryResult<GetVenueResult, Error> => {
  const getVenue = useMemo(
    () => createGetVenue(contractInteractor, config),
    [contractInteractor, config]
  )

  return useQuery({
    queryKey: ['getVenue', input.venueAddress],
    queryFn: () => getVenue(input),
    enabled: !!input.venueAddress
  })
}
