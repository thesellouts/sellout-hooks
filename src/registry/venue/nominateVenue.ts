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

const NominateVenueSchema = z.object({
  nominee: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type NominateVenueInput = z.infer<typeof NominateVenueSchema>

export interface NominateVenueResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

const nominateVenueCore = async (
  input: NominateVenueInput,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<NominateVenueResult> => {
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

export const nominateVenue = async (
  input: NominateVenueInput
): Promise<NominateVenueResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return nominateVenueCore(input, contractInteractor, config)
}

export const useNominateVenue = (
  input: NominateVenueInput
): UseMutationResult<NominateVenueResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () => {
      if (effectiveChainId !== base.id && effectiveChainId !== baseSepolia.id) {
        throw new Error(`Unsupported chain ID: ${effectiveChainId}`)
      }
      return nominateVenueCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      )
    },
    onError: error => {
      console.error('Error nominating venue:', error)
    }
  })
}
