import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetShowByIdSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowByIdInput = z.infer<typeof GetShowByIdSchema>

export const getShowById = async (
  input: GetShowByIdInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getShowById',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading show details:', error)
    throw new Error('Failed to fetch show details')
  }
}

export const useGetShowById = (
  input: GetShowByIdInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getShowById', input.showId],
    queryFn: () => getShowById(input, contractInteractor),
    enabled: !!input.showId
  })
}
