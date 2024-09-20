import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const DeregisterVenueSchema = z.object({
  venueId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type DeregisterVenueInput = z.infer<typeof DeregisterVenueSchema>

export interface DeregisterVenueResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createDeregisterVenue =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: DeregisterVenueInput): Promise<DeregisterVenueResult> => {
    const { chainId, venueId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = DeregisterVenueSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: VenueRegistryABI,
        address: addresses.VenueRegistry as `0x${string}`,
        functionName: 'deregisterVenue',
        args: [validatedInput.venueId],
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

export const useDeregisterVenue = (
  input: DeregisterVenueInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<DeregisterVenueResult, Error> => {
  const deregisterVenue = useMemo(
    () => createDeregisterVenue(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => deregisterVenue(input),
    onError: error => {
      console.error('Error deregistering venue:', error)
    }
  })
}
