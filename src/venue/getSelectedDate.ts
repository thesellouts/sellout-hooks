import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetSelectedDateSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetSelectedDateInput = z.infer<typeof GetSelectedDateSchema>

export const getSelectedDate = async (
  input: GetSelectedDateInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getSelectedDate',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting selected date:', error)
    throw new Error('Failed to fetch selected date')
  }
}

export const useGetSelectedDate = (
  input: GetSelectedDateInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getSelectedDate', input.showId],
    queryFn: () => getSelectedDate(input, contractInteractor),
    enabled: !!input.showId
  })
}
