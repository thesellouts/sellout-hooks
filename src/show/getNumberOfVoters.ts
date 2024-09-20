import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetNumberOfVotersSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetNumberOfVotersInput = z.infer<typeof GetNumberOfVotersSchema>

export const getNumberOfVoters = async (
  input: GetNumberOfVotersInput,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getNumberOfVoters',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading number of voters:', error)
    throw new Error('Failed to fetch number of voters')
  }
}

export const useGetNumberOfVoters = (
  input: GetNumberOfVotersInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getNumberOfVoters', input.showId],
    queryFn: () => getNumberOfVoters(input, contractInteractor),
    enabled: !!input.showId
  })
}
