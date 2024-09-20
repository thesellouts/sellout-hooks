import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetProposalsCountSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetProposalsCountInput = z.infer<typeof GetProposalsCountSchema>

export const getProposalsCount = async (
  input: GetProposalsCountInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getProposalsCount',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting proposals count:', error)
    throw new Error('Failed to fetch proposals count')
  }
}

export const useGetProposalsCount = (
  input: GetProposalsCountInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getProposalsCount', input.showId],
    queryFn: () => getProposalsCount(input, contractInteractor),
    enabled: !!input.showId
  })
}
