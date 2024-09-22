import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi } from 'viem'
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

const NominateOrganizerSchema = z.object({
  nominee: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type NominateOrganizerInput = z.infer<typeof NominateOrganizerSchema>

export interface NominateOrganizerResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const nominateOrganizerCore = async (
  input: NominateOrganizerInput,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<NominateOrganizerResult> => {
  const { chainId, nominee } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = NominateOrganizerSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: OrganizerRegistryABI,
      address: addresses.OrganizerRegistry as `0x${string}`,
      functionName: 'nominate',
      args: [validatedInput.nominee],
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

export const nominateOrganizer = async (
  input: NominateOrganizerInput
): Promise<NominateOrganizerResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return nominateOrganizerCore(input, contractInteractor, config)
}

export const useNominateOrganizer = (
  input: NominateOrganizerInput
): UseMutationResult<NominateOrganizerResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () =>
      nominateOrganizerCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error nominating organizer:', error)
    }
  })
}
