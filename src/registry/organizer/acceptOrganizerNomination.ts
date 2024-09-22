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

const AcceptNominationSchema = z.object({
  name: z.string(),
  bio: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type AcceptOrganizerNominationInput = z.infer<
  typeof AcceptNominationSchema
>

export interface AcceptOrganizerNominationResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

const acceptOrganizerNominationCore = async (
  input: AcceptOrganizerNominationInput,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<AcceptOrganizerNominationResult> => {
  const { name, bio, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = AcceptNominationSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: OrganizerRegistryABI,
      address: addresses.OrganizerRegistry as `0x${string}`,
      functionName: 'acceptNomination',
      args: [validatedInput.name, validatedInput.bio],
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

export const acceptOrganizerNomination = async (
  input: AcceptOrganizerNominationInput
): Promise<AcceptOrganizerNominationResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return acceptOrganizerNominationCore(input, contractInteractor, config)
}

export const useAcceptOrganizerNomination = (
  input: AcceptOrganizerNominationInput
): UseMutationResult<AcceptOrganizerNominationResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () =>
      acceptOrganizerNominationCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error accepting organizer nomination:', error)
    }
  })
}
