import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetSelectedProposalIndexSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetSelectedProposalIndexInput = z.infer<
  typeof GetSelectedProposalIndexSchema
>

export const getSelectedProposalIndex = async (
  input: GetSelectedProposalIndexInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
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
  input: GetSelectedProposalIndexInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getSelectedProposalIndex', input.showId],
    queryFn: () => getSelectedProposalIndex(input, contractInteractor),
    enabled: !!input.showId
  })
}
