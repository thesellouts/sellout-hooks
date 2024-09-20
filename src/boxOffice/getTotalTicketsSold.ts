import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { BoxOfficeABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetTotalTicketsSoldSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetTotalTicketsSoldInput = z.infer<typeof GetTotalTicketsSoldSchema>

export const getTotalTicketsSold = async (
  input: GetTotalTicketsSoldInput,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { chainId, showId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      abi: BoxOfficeABI as Abi,
      address: addresses.BoxOffice as `0x${string}`,
      functionName: 'getTotalTicketsSold',
      args: [showId]
    })
  } catch (err) {
    console.error('Error fetching total tickets sold:', err)
    throw err
  }
}

export const useGetTotalTicketsSold = (
  input: GetTotalTicketsSoldInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getTotalTicketsSold', input],
    queryFn: () => getTotalTicketsSold(input, contractInteractor),
    enabled: !!input.showId
  })
}
