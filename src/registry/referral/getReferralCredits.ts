import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses, wagmiConfig } from '../../config'
import { AddressSchema } from '../../utils'

const GetReferralCreditsSchema = z.object({
  referrer: AddressSchema,
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetReferralCreditsInput = z.infer<typeof GetReferralCreditsSchema>

export const getReferralCredits = async (input: GetReferralCreditsInput) => {
  const { chainId, referrer } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetReferralCreditsSchema.parse(input)

  return await readContract(wagmiConfig as unknown as Config, {
    abi: ReferralABI,
    address: addresses.ReferralModule as `0x${string}`,
    functionName: 'getReferralCredits',
    args: [validatedInput.referrer],
    chainId
  })
}

export const useGetReferralCredits = (input: GetReferralCreditsInput) => {
  return useQuery({
    queryKey: ['getReferralCredits', input.referrer],
    queryFn: () => getReferralCredits(input),
    enabled: !!input.referrer
  })
}
