import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetVotingPeriodsSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetVotingPeriodsInput = z.infer<typeof GetVotingPeriodsSchema>

const getVotingPeriodsCore = async (
  input: GetVotingPeriodsInput,
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

export const getVotingPeriods = async (
  input: GetVotingPeriodsInput
): Promise<any> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getVotingPeriodsCore(input, contractInteractor)
}

export const useGetVotingPeriods = (input: GetVotingPeriodsInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
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
