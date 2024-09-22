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

const GetHasDateVotedSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetHasDateVotedInput = z.infer<typeof GetHasDateVotedSchema>

const getHasDateVotedCore = async (
  input: GetHasDateVotedInput,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { showId, user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<boolean>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getHasDateVoted',
      args: [showId, user]
    })
  } catch (error) {
    console.error('Error checking if user has date voted:', error)
    throw new Error('Failed to check if user has date voted')
  }
}

export const getHasDateVoted = async (
  input: GetHasDateVotedInput
): Promise<boolean> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getHasDateVotedCore(input, contractInteractor)
}

export const useGetHasDateVoted = (input: GetHasDateVotedInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getHasDateVoted', input.showId, input.user],
    queryFn: () =>
      getHasDateVotedCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && !!input.user
  })
}
