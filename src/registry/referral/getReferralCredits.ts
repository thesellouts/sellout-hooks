import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../../contractInteractor'
import { AddressSchema } from '../../utils'

const GetReferralCreditsSchema = z.object({
  referrer: AddressSchema,
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetReferralCredits = z.infer<typeof GetReferralCreditsSchema>

export interface GetReferralCreditsResult {
  artistCredits: bigint
  organizerCredits: bigint
  venueCredits: bigint
}

export const getReferralCreditsCore = async (
  input: GetReferralCredits,
  contractInteractor: ContractInteractor
): Promise<GetReferralCreditsResult> => {
  const { chainId, referrer } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = GetReferralCreditsSchema.parse(input)

    const result = await contractInteractor.read({
      abi: ReferralABI as Abi,
      address: addresses.ReferralModule as `0x${string}`,
      functionName: 'getReferralCredits',
      args: [validatedInput.referrer]
    })

    if (
      result &&
      typeof result === 'object' &&
      'artist' in result &&
      'organizer' in result &&
      'venue' in result
    ) {
      const {
        artist: artistCredits,
        organizer: organizerCredits,
        venue: venueCredits
      } = result as {
        artist: bigint
        organizer: bigint
        venue: bigint
      }

      return {
        artistCredits,
        organizerCredits,
        venueCredits
      }
    } else {
      console.error('Unexpected result format:', result)
      throw new Error('Unexpected result format from getReferralCredits')
    }
  } catch (err) {
    console.error('Error fetching referral credits:', err)
    throw new Error('Failed to fetch referral credits')
  }
}

type UseGetReferralCreditsOptions = Omit<
  UseQueryOptions<
    GetReferralCreditsResult,
    Error,
    GetReferralCreditsResult,
    [string, string]
  >,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetReferralCredits = (
  input: GetReferralCredits,
  options?: UseGetReferralCreditsOptions
): UseQueryResult<GetReferralCreditsResult, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getReferralCredits', input.referrer],
    queryFn: () =>
      getReferralCreditsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined ? enabled && !!input.referrer : !!input.referrer,
    ...queryOptions
  })
}
