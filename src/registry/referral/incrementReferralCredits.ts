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

const IncrementReferralCreditsSchema = z.object({
  referrerAddress: AddressSchema,
  artistCredits: z.number(),
  organizerCredits: z.number(),
  venueCredits: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IncrementReferralCredits = z.infer<
  typeof IncrementReferralCreditsSchema
>

export interface IncrementReferralCreditsResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const incrementReferralCreditsCore = async (
  input: IncrementReferralCredits,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<IncrementReferralCreditsResult> => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = IncrementReferralCreditsSchema.parse(input)
    const account =
      options?.smart !== false
        ? contractInteractor.smartAccountAddress
        : undefined

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
      chainId,
      account
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

export const useIncrementReferralCredits = (
  input: IncrementReferralCredits,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<IncrementReferralCreditsResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

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
