import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../../contractInteractor'

const DeregisterVenueSchema = z.object({
  venueId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type DeregisterVenueInput = z.infer<typeof DeregisterVenueSchema>

export interface DeregisterVenueResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

const deregisterVenueCore = async (
  input: DeregisterVenueInput,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<DeregisterVenueResult> => {
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

export const deregisterVenue = async (
  input: DeregisterVenueInput
): Promise<DeregisterVenueResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return deregisterVenueCore(input, contractInteractor, config)
}

export const useDeregisterVenue = (
  input: DeregisterVenueInput
): UseMutationResult<DeregisterVenueResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () =>
      deregisterVenueCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error deregistering venue:', error)
    }
  })
}
