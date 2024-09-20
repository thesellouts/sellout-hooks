import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const DeregisterOrganizerSchema = z.object({
  organizerId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type DeregisterOrganizerInput = z.infer<typeof DeregisterOrganizerSchema>

export interface DeregisterOrganizerResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createDeregisterOrganizer =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (
    input: DeregisterOrganizerInput
  ): Promise<DeregisterOrganizerResult> => {
    const { chainId, organizerId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = DeregisterOrganizerSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: OrganizerRegistryABI,
        address: addresses.OrganizerRegistry as `0x${string}`,
        functionName: 'deregisterOrganizer',
        args: [validatedInput.organizerId],
        chainId
      })

      // Execute the contract interaction
      const receipt = await contractInteractor.execute({
        address: request.address,
        abi: OrganizerRegistryABI as Abi,
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

export const useDeregisterOrganizer = (
  input: DeregisterOrganizerInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<DeregisterOrganizerResult, Error> => {
  const deregisterOrganizer = useMemo(
    () => createDeregisterOrganizer(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => deregisterOrganizer(input),
    onError: error => {
      console.error('Error deregistering organizer:', error)
    }
  })
}
