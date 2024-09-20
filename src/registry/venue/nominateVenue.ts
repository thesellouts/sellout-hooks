import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const NominateVenueSchema = z.object({
  nominee: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type NominateVenueInput = z.infer<typeof NominateVenueSchema>

export interface NominateVenueResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createNominateVenue =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: NominateVenueInput): Promise<NominateVenueResult> => {
    const { chainId, nominee } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = NominateVenueSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: VenueRegistryABI,
        address: addresses.VenueRegistry as `0x${string}`,
        functionName: 'nominate',
        args: [validatedInput.nominee],
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

export const useNominateVenue = (
  input: NominateVenueInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<NominateVenueResult, Error> => {
  const nominateVenue = useMemo(
    () => createNominateVenue(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => nominateVenue(input),
    onError: error => {
      console.error('Error nominating venue:', error)
    }
  })
}
