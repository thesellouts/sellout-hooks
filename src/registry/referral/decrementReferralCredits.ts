import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ContractInteractor,
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

export type DecrementReferralCredits = z.infer<
  typeof DecrementReferralCreditsSchema
>

export interface DecrementReferralCreditsResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const decrementReferralCreditsCore = async (
  input: DecrementReferralCredits,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
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
    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: ReferralABI as Abi,
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

export const useDecrementReferralCredits = (
  input: DecrementReferralCredits,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<DecrementReferralCreditsResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (contextChainId ?? input.chainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

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
