import { useQuery } from '@tanstack/react-query'
import BoxOfficeABI from '@thesellouts/sellout-protocol/abis/BoxOffice.json'
import { Config, readContract } from '@wagmi/core'
import { base, baseSepolia, sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { getContractAddresses } from '../config'

const GetTicketPricePaidSchema = z.object({
  showId: z.string(),
  ticketId: z.number(),
  chainId: z.union([
    z.literal(base.id),
    z.literal(baseSepolia.id)
  ])
})

export type GetTicketPricePaidType = z.infer<typeof GetTicketPricePaidSchema>

export const getTicketPricePaid = async (
  input: GetTicketPricePaidType,
  config: Config
) => {
  const { chainId, showId, ticketId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = GetTicketPricePaidSchema.parse(input)

    const result = await readContract(config, {
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

export const useGetTicketPricePaid = (
  input: GetTicketPricePaidType,
  config: Config
) => {
  return useQuery({
    queryKey: ['getTicketPricePaid', input],
    queryFn: () => getTicketPricePaid(input, config)
  })
}
