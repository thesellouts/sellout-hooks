import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../../contractInteractor'

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
  receipt: TransactionReceipt
}

const updateOrganizerCore = async (
  input: UpdateOrganizerInput,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<UpdateOrganizerResult> => {
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

export const updateOrganizer = async (
  input: UpdateOrganizerInput
): Promise<UpdateOrganizerResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return updateOrganizerCore(input, contractInteractor, config)
}

export const useUpdateOrganizer = (
  input: UpdateOrganizerInput
): UseMutationResult<UpdateOrganizerResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () =>
      updateOrganizerCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error updating organizer:', error)
    }
  })
}
