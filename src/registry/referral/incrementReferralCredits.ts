import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../../contractInteractor'
import { AddressSchema } from '../../utils'

const IncrementReferralCreditsSchema = z.object({
  referrerAddress: AddressSchema,
  artistCredits: z.number(),
  organizerCredits: z.number(),
  venueCredits: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IncrementReferralCreditsInput = z.infer<
  typeof IncrementReferralCreditsSchema
>

export interface IncrementReferralCreditsResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

const incrementReferralCreditsCore = async (
  input: IncrementReferralCreditsInput,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<IncrementReferralCreditsResult> => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = IncrementReferralCreditsSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: ReferralABI,
      address: addresses.ReferralModule as `0x${string}`,
      functionName: 'incrementReferralCredits',
      args: [
        validatedInput.referrerAddress,
        validatedInput.artistCredits,
        validatedInput.organizerCredits,
        validatedInput.venueCredits
      ],
      chainId
    })

    // Execute the contract interaction
    const receipt = await contractInteractor.execute({
      address: request.address,
      abi: ReferralABI as Abi,
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

export const incrementReferralCredits = async (
  input: IncrementReferralCreditsInput
): Promise<IncrementReferralCreditsResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return incrementReferralCreditsCore(input, contractInteractor, config)
}

export const useIncrementReferralCredits = (
  input: IncrementReferralCreditsInput
): UseMutationResult<IncrementReferralCreditsResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () => {
      if (effectiveChainId !== base.id && effectiveChainId !== baseSepolia.id) {
        throw new Error(`Unsupported chain ID: ${effectiveChainId}`)
      }
      return incrementReferralCreditsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      )
    },
    onError: error => {
      console.error('Error incrementing referral credits:', error)
    }
  })
}
