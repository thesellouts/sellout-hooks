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

const GetHasDateVotedSchema = z.object({
  showId: z.string(),
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetHasDateVoted = z.infer<typeof GetHasDateVotedSchema>

export const getHasDateVotedCore = async (
  input: GetHasDateVoted,
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

export const useGetHasDateVoted = (input: GetHasDateVoted) => {
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
