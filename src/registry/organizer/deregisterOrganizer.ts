import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../../contractInteractor'

const DeregisterOrganizerSchema = z.object({
  organizerId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type DeregisterOrganizer = z.infer<typeof DeregisterOrganizerSchema>

export interface DeregisterOrganizerResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const deregisterOrganizerCore = async (
  input: DeregisterOrganizer,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
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
    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: OrganizerRegistryABI as Abi,
        functionName: request.functionName,
        args: request.args ? [...request.args] : undefined
      },
      options
    )

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
  input: DeregisterOrganizer,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<DeregisterOrganizerResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (contextChainId ?? input.chainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      deregisterOrganizerCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error deregistering organizer:', error)
    }
  })
}
