import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'
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
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createIncrementReferralCredits =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (
    input: IncrementReferralCreditsInput
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

export const useIncrementReferralCredits = (
  input: IncrementReferralCreditsInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<IncrementReferralCreditsResult, Error> => {
  const incrementReferralCredits = useMemo(
    () => createIncrementReferralCredits(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => incrementReferralCredits(input),
    onError: error => {
      console.error('Error incrementing referral credits:', error)
    }
  })
}
