import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetPreviousDateVotesSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetPreviousDateVotes = z.infer<typeof GetPreviousDateVotesSchema>

export const getPreviousDateVoteCore = async (
  input: GetPreviousDateVotes,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getPreviousDateVote',
      args: [showId, user]
    })
  } catch (error) {
    console.error('Error getting previous date vote:', error)
    throw new Error('Failed to fetch previous date vote')
  }
}

export const useGetPreviousDateVote = (input: GetPreviousDateVotes) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getPreviousDateVote', input.showId, input.user],
    queryFn: () =>
      getPreviousDateVoteCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && !!input.user
  })
}
