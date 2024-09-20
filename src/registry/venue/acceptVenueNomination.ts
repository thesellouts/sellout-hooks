import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const AcceptNominationSchema = z.object({
  name: z.string(),
  bio: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  totalCapacity: z.number(),
  streetAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type AcceptVenueNominationInput = z.infer<typeof AcceptNominationSchema>

export interface AcceptVenueNominationResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createAcceptVenueNomination =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (
    input: AcceptVenueNominationInput
  ): Promise<AcceptVenueNominationResult> => {
    const {
      chainId,
      name,
      bio,
      latitude,
      longitude,
      totalCapacity,
      streetAddress
    } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = AcceptNominationSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: VenueRegistryABI,
        address: addresses.VenueRegistry as `0x${string}`,
        functionName: 'acceptNomination',
        args: [
          validatedInput.name,
          validatedInput.bio,
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

export const useAcceptVenueNomination = (
  input: AcceptVenueNominationInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<AcceptVenueNominationResult, Error> => {
  const acceptVenueNomination = useMemo(
    () => createAcceptVenueNomination(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => acceptVenueNomination(input),
    onError: error => {
      console.error('Error accepting venue nomination:', error)
    }
  })
}
