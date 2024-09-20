import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const UpdateOrganizerSchema = z.object({
  organizerId: z.number(),
  name: z.string(),
  bio: z.string(),
  wallet: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type UpdateOrganizerInput = z.infer<typeof UpdateOrganizerSchema>

export interface UpdateOrganizerResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createUpdateOrganizer =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: UpdateOrganizerInput): Promise<UpdateOrganizerResult> => {
    const { chainId, organizerId, name, bio, wallet } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = UpdateOrganizerSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: OrganizerRegistryABI,
        address: addresses.OrganizerRegistry as `0x${string}`,
        functionName: 'updateOrganizer',
        args: [
          validatedInput.organizerId,
          validatedInput.name,
          validatedInput.bio,
          validatedInput.wallet
        ],
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

export const useUpdateOrganizer = (
  input: UpdateOrganizerInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<UpdateOrganizerResult, Error> => {
  const updateOrganizer = useMemo(
    () => createUpdateOrganizer(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => updateOrganizer(input),
    onError: error => {
      console.error('Error updating organizer:', error)
    }
  })
}
