import BoxOfficeABI from '@lucidlabs/sellout-protocol/abis/BoxOffice.json'
import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { getContractAddresses } from '../config'

const GetTotalTicketsSoldSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetTotalTicketsSoldType = z.infer<typeof GetTotalTicketsSoldSchema>

export const getTotalTicketsSold = async (
  input: GetTotalTicketsSoldType,
  config: Config
) => {
  const { chainId, showId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = GetTotalTicketsSoldSchema.parse(input)

    const result = await readContract(config, {
      abi: BoxOfficeABI.abi,
      address: addresses.BoxOffice as `0x${string}`,
      functionName: 'getTotalTicketsSold',
      args: [validatedInput.showId],
      chainId
    })

    return result as bigint
  } catch (err) {
    console.error('Error fetching total tickets sold:', err)
    throw err
  }
}

export const useGetTotalTicketsSold = (
  input: GetTotalTicketsSoldType,
  config: Config
) => {
  return useQuery({
    queryKey: ['getTotalTicketsSold', input],
    queryFn: () => getTotalTicketsSold(input, config)
  })
}
