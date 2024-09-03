import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { AddressSchema } from '../../utils'

const DecrementReferralCreditsSchema = z.object({
  referrer: AddressSchema,
  artistCredits: z.number(),
  organizerCredits: z.number(),
  venueCredits: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type DecrementReferralCreditsInput = z.infer<
  typeof DecrementReferralCreditsSchema
>

export const decrementReferralCredits = async (
  input: DecrementReferralCreditsInput,
  config: Config
) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = DecrementReferralCreditsSchema.parse(input)

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

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useDecrementReferralCredits = (
  input: DecrementReferralCreditsInput,
  config: Config
) => {
  return useMutation({
    mutationFn: () => decrementReferralCredits(input, config),
    onError: error => {
      console.error('Error decrementing referral credits:', error)
    }
  })
}
