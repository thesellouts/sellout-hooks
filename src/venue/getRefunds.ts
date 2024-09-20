import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetRefundsSchema = z.object({
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetRefundsInput = z.infer<typeof GetRefundsSchema>

export const getRefunds = async (
  input: GetRefundsInput,
  contractInteractor: ContractInteractor
) => {
  const { user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getRefunds',
      args: [user]
    })
  } catch (error) {
    console.error('Error getting refunds:', error)
    throw new Error('Failed to fetch refunds')
  }
}

export const useGetRefunds = (
  input: GetRefundsInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getRefunds', input.user],
    queryFn: () => getRefunds(input, contractInteractor),
    enabled: !!input.user
  })
}
