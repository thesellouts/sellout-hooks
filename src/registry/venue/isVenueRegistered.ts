import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Config } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const IsVenueRegisteredSchema = z.object({
  venueAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsVenueRegisteredInput = z.infer<typeof IsVenueRegisteredSchema>

export interface IsVenueRegisteredResult {
  isRegistered: boolean
}

const createIsVenueRegistered =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: IsVenueRegisteredInput): Promise<IsVenueRegisteredResult> => {
    const { chainId, venueAddress } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = IsVenueRegisteredSchema.parse(input)

      // Execute the contract interaction using readContract
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
  input: IsVenueRegisteredInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseQueryResult<IsVenueRegisteredResult, Error> => {
  const isVenueRegistered = useMemo(
    () => createIsVenueRegistered(contractInteractor, config),
    [contractInteractor, config]
  )

  return useQuery({
    queryKey: ['isVenueRegistered', input.venueAddress],
    queryFn: () => isVenueRegistered(input),
    enabled: !!input.venueAddress
  })
}
