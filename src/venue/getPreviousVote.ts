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

const GetPreviousVoteSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetPreviousVoteInput = z.infer<typeof GetPreviousVoteSchema>

const getPreviousVoteCore = async (
  input: GetPreviousVoteInput,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getPreviousVote',
      args: [showId, user]
    })
  } catch (error) {
    console.error('Error getting previous vote:', error)
    throw new Error('Failed to fetch previous vote')
  }
}

export const getPreviousVote = async (
  input: GetPreviousVoteInput
): Promise<bigint> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getPreviousVoteCore(input, contractInteractor)
}

export const useGetPreviousVote = (input: GetPreviousVoteInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getPreviousVote', input.showId, input.user],
    queryFn: () =>
      getPreviousVoteCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && !!input.user
  })
}
