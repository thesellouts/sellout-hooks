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
import { getContractAddresses, wagmiConfig } from '../../config'
import { AddressSchema } from '../../utils'

const IncrementReferralCreditsSchema = z.object({
  referrerAddress: AddressSchema,
  artistCredits: z.number(),
  organizerCredits: z.number(),
  venueCredits: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type IncrementReferralCreditsInput = z.infer<
  typeof IncrementReferralCreditsSchema
>

export const incrementReferralCredits = async (
  input: IncrementReferralCreditsInput
) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = IncrementReferralCreditsSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig, {
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

  const hash = await writeContract(wagmiConfig, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(wagmiConfig, { hash })
  }
}

export const useIncrementReferralCredits = () => {
  return useMutation({
    mutationFn: (input: IncrementReferralCreditsInput) =>
      incrementReferralCredits(input),
    onError: error => {
      console.error('Error incrementing referral credits:', error)
    }
  })
}
