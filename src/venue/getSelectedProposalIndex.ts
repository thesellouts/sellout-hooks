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

const GetSelectedProposalIndexSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetSelectedProposalIndex = z.infer<
  typeof GetSelectedProposalIndexSchema
>

export const getSelectedProposalIndexCore = async (
  input: GetSelectedProposalIndex,
  contractInteractor: ContractInteractor
): Promise<number> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<number>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getSelectedProposalIndex',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting selected proposal index:', error)
    throw new Error('Failed to fetch selected proposal index')
  }
}

export const useGetSelectedProposalIndex = (
  input: GetSelectedProposalIndex
) => {
  const contextChainId = useChainId()
  const effectiveChainId = (contextChainId ?? input.chainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getSelectedProposalIndex', input.showId],
    queryFn: () =>
      getSelectedProposalIndexCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId
  })
}
