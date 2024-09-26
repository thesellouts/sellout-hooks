import { useQuery } from '@tanstack/react-query'
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
) => {
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

export const useGetTicketPricePaidAndTierIndex = (
  input: GetTicketPricePaidAndTierIndex
) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getTicketPricePaidAndTierIndex', input.showId, input.ticketId],
    queryFn: () =>
      getTicketPricePaidAndTierIndexCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && !!input.ticketId
  })
}
