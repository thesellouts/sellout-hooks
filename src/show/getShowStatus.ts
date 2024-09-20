import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetShowStatusSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowStatusInput = z.infer<typeof GetShowStatusSchema>

export const getShowStatus = async (
  input: GetShowStatusInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<number>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getShowStatus',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading show status:', error)
    throw new Error('Failed to fetch show status')
  }
}

export const useGetShowStatus = (
  input: GetShowStatusInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getShowStatus', input.showId],
    queryFn: () => getShowStatus(input, contractInteractor),
    enabled: !!input.showId
  })
}
