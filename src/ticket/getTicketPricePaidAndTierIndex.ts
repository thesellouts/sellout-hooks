import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const GetTicketPricePaidAndTierIndexSchema = z.object({
  showId: z.string(),
  ticketId: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetTicketPricePaidAndTierIndexInput = z.infer<
  typeof GetTicketPricePaidAndTierIndexSchema
>

export const getTicketPricePaidAndTierIndex = async (
  input: GetTicketPricePaidAndTierIndexInput
) => {
  const { showId, ticketId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(wagmiConfig as unknown as Config, {
      address: addresses.Ticket as `0x${string}`,
      abi: TicketABI,
      functionName: 'getTicketPricePaidAndTierIndex',
      args: [showId, ticketId],
      chainId
    })
  } catch (error) {
    console.error('Error getting ticket price and tier index:', error)
    throw new Error('Failed to get ticket price and tier index')
  }
}

export const useGetTicketPricePaidAndTierIndex = (
  input: GetTicketPricePaidAndTierIndexInput
) => {
  return useQuery({
    queryKey: ['getTicketPricePaidAndTierIndex', input.showId, input.ticketId],
    queryFn: () => getTicketPricePaidAndTierIndex(input),
    enabled: !!input.showId && !!input.ticketId
  })
}
