import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { AddressSchema } from '../../utils'

const GetReferralCreditsSchema = z.object({
  referrer: AddressSchema,
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetReferralCreditsInput = z.infer<typeof GetReferralCreditsSchema>

export const getReferralCredits = async (
  input: GetReferralCreditsInput,
  config: Config
) => {
  const { chainId, referrer } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetReferralCreditsSchema.parse(input)

  return await readContract(config, {
    abi: ReferralABI,
    address: addresses.ReferralModule as `0x${string}`,
    functionName: 'getReferralCredits',
    args: [validatedInput.referrer],
    chainId
  })
}

export const useGetReferralCredits = (
  input: GetReferralCreditsInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getReferralCredits', input.referrer],
    queryFn: () => getReferralCredits(input, config),
    enabled: !!input.referrer
  })
}
