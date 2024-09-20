import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetProposalPeriodSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetProposalPeriodInput = z.infer<typeof GetProposalPeriodSchema>

export const getProposalPeriod = async (
  input: GetProposalPeriodInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getProposalPeriod',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting proposal period:', error)
    throw new Error('Failed to fetch proposal period')
  }
}

export const useGetProposalPeriod = (
  input: GetProposalPeriodInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getProposalPeriod', input.showId],
    queryFn: () => getProposalPeriod(input, contractInteractor),
    enabled: !!input.showId
  })
}
