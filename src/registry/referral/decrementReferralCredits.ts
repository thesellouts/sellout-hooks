import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi } from 'viem'
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

const DecrementReferralCreditsSchema = z.object({
  referrer: AddressSchema,
  artistCredits: z.number(),
  organizerCredits: z.number(),
  venueCredits: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type DecrementReferralCreditsInput = z.infer<
  typeof DecrementReferralCreditsSchema
>

export interface DecrementReferralCreditsResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const decrementReferralCreditsCore = async (
  input: DecrementReferralCreditsInput,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<DecrementReferralCreditsResult> => {
  const { chainId, referrer, artistCredits, organizerCredits, venueCredits } =
    input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = DecrementReferralCreditsSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: ReferralABI,
      address: addresses.ReferralModule as `0x${string}`,
      functionName: 'decrementReferralCredits',
      args: [
        validatedInput.referrer,
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

export const decrementReferralCredits = async (
  input: DecrementReferralCreditsInput
): Promise<DecrementReferralCreditsResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return decrementReferralCreditsCore(input, contractInteractor, config)
}

export const useDecrementReferralCredits = (
  input: DecrementReferralCreditsInput
): UseMutationResult<DecrementReferralCreditsResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () =>
      decrementReferralCreditsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error decrementing referral credits:', error)
    }
  })
}
