import BoxOfficeABI from '@lucidlabs/sellout-protocol/abis/BoxOffice.json'
import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { getContractAddresses, wagmiConfig } from '../config'

const GetTicketPricePaidSchema = z.object({
  showId: z.string(),
  ticketId: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetTicketPricePaidType = z.infer<typeof GetTicketPricePaidSchema>

export const getTicketPricePaid = async (input: GetTicketPricePaidType) => {
  const { chainId, showId, ticketId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = GetTicketPricePaidSchema.parse(input)

    const result = await readContract(wagmiConfig, {
      abi: BoxOfficeABI.abi,
      address: addresses.BoxOffice as `0x${string}`,
      functionName: 'getTicketPricePaid',
      args: [validatedInput.showId, validatedInput.ticketId],
      chainId
    })

    return result as bigint
  } catch (err) {
    console.error('Error fetching ticket price paid:', err)
    throw err
  }
}

export const useGetTicketPricePaid = (input: GetTicketPricePaidType) => {
  return useQuery({
    queryKey: ['getTicketPricePaid', input],
    queryFn: () => getTicketPricePaid(input)
  })
}
