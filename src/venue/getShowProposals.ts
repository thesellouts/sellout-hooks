import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetShowProposalsSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowProposalsInput = z.infer<typeof GetShowProposalsSchema>

export const getShowProposals = async (
  input: GetShowProposalsInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getShowProposals',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting show proposals:', error)
    throw new Error('Failed to fetch show proposals')
  }
}

export const useGetShowProposals = (
  input: GetShowProposalsInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getShowProposals', input.showId],
    queryFn: () => getShowProposals(input, contractInteractor),
    enabled: !!input.showId
  })
}
