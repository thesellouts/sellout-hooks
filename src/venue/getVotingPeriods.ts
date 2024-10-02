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

const GetVotingPeriodsSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetVotingPeriods = z.infer<typeof GetVotingPeriodsSchema>

export const getVotingPeriodsCore = async (
  input: GetVotingPeriods,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<any>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getVotingPeriods',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting voting periods:', error)
    throw new Error('Failed to fetch voting periods')
  }
}

export const useGetVotingPeriods = (input: GetVotingPeriods) => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getVotingPeriods', input.showId],
    queryFn: () =>
      getVotingPeriodsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId
  })
}
