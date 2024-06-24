import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'

const GetShowToTicketProxySchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetShowToTicketProxyInput = z.infer<
  typeof GetShowToTicketProxySchema
>

export const getShowToTicketProxy = async (
  input: GetShowToTicketProxyInput,
  config: Config
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await readContract(config, {
      address: addresses.Show as `0x${string}`,
      abi: ShowABI,
      functionName: 'getShowToTicketProxy',
      args: [showId],
      chainId
    })
  } catch (error) {
    console.error('Error reading ticket proxy:', error)
    throw new Error('Failed to fetch ticket proxy')
  }
}

export const useGetShowToTicketProxy = (
  input: GetShowToTicketProxyInput,
  config: Config
) => {
  return useQuery({
    queryKey: ['getShowToTicketProxy', input.showId],
    queryFn: () => getShowToTicketProxy(input, config),
    enabled: !!input.showId
  })
}
