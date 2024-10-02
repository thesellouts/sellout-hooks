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

const GetDateVotesSchema = z.object({
  showId: z.string(),
  date: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetDateVotes = z.infer<typeof GetDateVotesSchema>

export const getDateVotesCore = async (
  input: GetDateVotes,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, date, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getDateVotes',
      args: [showId, date]
    })
  } catch (error) {
    console.error('Error getting date votes:', error)
    throw new Error('Failed to fetch date votes')
  }
}

export const useGetDateVotes = (input: GetDateVotes) => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getDateVotes', input.showId, input.date],
    queryFn: () =>
      getDateVotesCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && !!input.date
  })
}
