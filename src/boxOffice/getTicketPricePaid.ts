import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { BoxOfficeABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetTicketPricePaidSchema = z.object({
  showId: z.string(),
  ticketId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetTicketPricePaidInput = z.infer<typeof GetTicketPricePaidSchema>

export const getTicketPricePaid = async (
  input: GetTicketPricePaidInput,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { chainId, showId, ticketId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      abi: BoxOfficeABI as Abi,
      address: addresses.BoxOffice as `0x${string}`,
      functionName: 'getTicketPricePaid',
      args: [showId, ticketId]
    })
  } catch (err) {
    console.error('Error fetching ticket price paid:', err)
    throw err
  }
}

export const useGetTicketPricePaid = (
  input: GetTicketPricePaidInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getTicketPricePaid', input],
    queryFn: () => getTicketPricePaid(input, contractInteractor),
    enabled: !!input.showId && !!input.ticketId
  })
}
