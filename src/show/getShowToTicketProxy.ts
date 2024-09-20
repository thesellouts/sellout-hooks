import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetShowToTicketProxySchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowToTicketProxyInput = z.infer<
  typeof GetShowToTicketProxySchema
>

export const getShowToTicketProxy = async (
  input: GetShowToTicketProxyInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<`0x${string}`>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getShowToTicketProxy',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading ticket proxy:', error)
    throw new Error('Failed to fetch ticket proxy')
  }
}

export const useGetShowToTicketProxy = (
  input: GetShowToTicketProxyInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getShowToTicketProxy', input.showId],
    queryFn: () => getShowToTicketProxy(input, contractInteractor),
    enabled: !!input.showId
  })
}
