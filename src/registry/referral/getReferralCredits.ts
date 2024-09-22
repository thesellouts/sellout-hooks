import { useQuery, UseQueryResult } from '@tanstack/react-query'
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

const GetReferralCreditsSchema = z.object({
  referrer: AddressSchema,
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetReferralCreditsInput = z.infer<typeof GetReferralCreditsSchema>

export interface GetReferralCreditsResult {
  artistCredits: bigint
  organizerCredits: bigint
  venueCredits: bigint
}

const getReferralCreditsCore = async (
  input: GetReferralCreditsInput,
  contractInteractor: ContractInteractor
): Promise<GetReferralCreditsResult> => {
  const { chainId, referrer } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = GetReferralCreditsSchema.parse(input)

    // Cast the result to the expected type (tuple of bigints)
    const [artistCredits, organizerCredits, venueCredits] =
      (await contractInteractor.read({
        abi: ReferralABI as Abi,
        address: addresses.ReferralModule as `0x${string}`,
        functionName: 'getReferralCredits',
        args: [validatedInput.referrer]
      })) as [bigint, bigint, bigint] // Type assertion for destructuring

    return {
      artistCredits,
      organizerCredits,
      venueCredits
    }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const getReferralCredits = async (
  input: GetReferralCreditsInput
): Promise<GetReferralCreditsResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getReferralCreditsCore(input, contractInteractor)
}

export const useGetReferralCredits = (
  input: GetReferralCreditsInput
): UseQueryResult<GetReferralCreditsResult, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getReferralCredits', input.referrer],
    queryFn: () =>
      getReferralCreditsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.referrer
  })
}
