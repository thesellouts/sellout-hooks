import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { AddressSchema } from '../../utils'

const IncrementReferralCreditsSchema = z.object({
  referrerAddress: AddressSchema,
  artistCredits: z.number(),
  organizerCredits: z.number(),
  venueCredits: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IncrementReferralCreditsInput = z.infer<
  typeof IncrementReferralCreditsSchema
>

export const incrementReferralCredits = async (
  input: IncrementReferralCreditsInput,
  config: Config
) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = IncrementReferralCreditsSchema.parse(input)

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

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useIncrementReferralCredits = (
  input: IncrementReferralCreditsInput,
  config: Config
) => {
  return useMutation({
    mutationFn: () => incrementReferralCredits(input, config),
    onError: error => {
      console.error('Error incrementing referral credits:', error)
    }
  })
}
