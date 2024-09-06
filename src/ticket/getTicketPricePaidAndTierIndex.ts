import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { getContractAddresses } from '../config'

const GetTicketPricePaidAndTierIndexSchema = z.object({
  showId: z.string(),
  ticketId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetTicketPricePaidAndTierIndexInput = z.infer<
  typeof GetTicketPricePaidAndTierIndexSchema
>

export const getTicketPricePaidAndTierIndex = async (
  input: GetTicketPricePaidAndTierIndexInput,
  config: Config
) => {
  const { showId, ticketId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
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
  input: GetTicketPricePaidAndTierIndexInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getTicketPricePaidAndTierIndex', input.showId, input.ticketId],
    queryFn: () => getTicketPricePaidAndTierIndex(input, config),
    enabled: !!input.showId && !!input.ticketId
  })
}
