import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetTicketPricePaidAndTierIndexSchema = z.object({
  showId: z.string(),
  ticketId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetTicketPricePaidAndTierIndex = z.infer<
  typeof GetTicketPricePaidAndTierIndexSchema
>

export const getTicketPricePaidAndTierIndexCore = async (
  input: GetTicketPricePaidAndTierIndex,
  contractInteractor: ContractInteractor
): Promise<[bigint, number]> => {
  const { showId, ticketId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Ticket as `0x${string}`,
      abi: TicketABI as Abi,
      functionName: 'getTicketPricePaidAndTierIndex',
      args: [showId, ticketId]
    })
  } catch (error) {
    console.error('Error getting ticket price and tier index:', error)
    throw new Error('Failed to get ticket price and tier index')
  }
}

type UseGetTicketPricePaidAndTierIndexOptions = Omit<
  UseQueryOptions<
    [bigint, number],
    Error,
    [bigint, number],
    [string, string, number]
  >,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetTicketPricePaidAndTierIndex = (
  input: GetTicketPricePaidAndTierIndex,
  options?: UseGetTicketPricePaidAndTierIndexOptions
): UseQueryResult<[bigint, number], Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getTicketPricePaidAndTierIndex', input.showId, input.ticketId],
    queryFn: () =>
      getTicketPricePaidAndTierIndexCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.showId && !!input.ticketId
        : !!input.showId && !!input.ticketId,
    ...queryOptions
  })
}
