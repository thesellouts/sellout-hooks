import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'
import { AddressSchema } from '../../utils'

const GetReferralCreditsSchema = z.object({
  referrer: AddressSchema,
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetReferralCreditsInput = z.infer<typeof GetReferralCreditsSchema>

export const getReferralCredits = async (
  input: GetReferralCreditsInput,
  contractInteractor: ContractInteractor
) => {
  const { chainId, referrer } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = GetReferralCreditsSchema.parse(input)

  return await contractInteractor.read({
    abi: ReferralABI as Abi,
    address: addresses.ReferralModule as `0x${string}`,
    functionName: 'getReferralCredits',
    args: [validatedInput.referrer]
  })
}

export const useGetReferralCredits = (
  input: GetReferralCreditsInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getReferralCredits', input.referrer],
    queryFn: () => getReferralCredits(input, contractInteractor),
    enabled: !!input.referrer
  })
}
