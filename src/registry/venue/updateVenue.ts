import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const UpdateVenueSchema = z.object({
  venueId: z.number(),
  name: z.string(),
  bio: z.string(),
  wallet: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  totalCapacity: z.number(),
  streetAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>

export interface UpdateVenueResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createUpdateVenue =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: UpdateVenueInput): Promise<UpdateVenueResult> => {
    const { chainId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = UpdateVenueSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: VenueRegistryABI,
        address: addresses.VenueRegistry as `0x${string}`,
        functionName: 'updateVenue',
        args: [
          validatedInput.venueId,
          validatedInput.name,
          validatedInput.bio,
          validatedInput.wallet,
          validatedInput.latitude,
          validatedInput.longitude,
          validatedInput.totalCapacity,
          validatedInput.streetAddress
        ],
        chainId
      })

      // Execute the contract interaction
      const receipt = await contractInteractor.execute({
        address: request.address,
        abi: VenueRegistryABI as Abi,
        functionName: request.functionName,
        args: request.args ? [...request.args] : undefined
      })

      return {
        hash: receipt.transactionHash,
        receipt
      }
    } catch (err) {
      console.error('Validation or Execution Error:', err)
      throw err
    }
  }

export const useUpdateVenue = (
  input: UpdateVenueInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<UpdateVenueResult, Error> => {
  const updateVenue = useMemo(
    () => createUpdateVenue(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => updateVenue(input),
    onError: error => {
      console.error('Error updating venue:', error)
    }
  })
}
