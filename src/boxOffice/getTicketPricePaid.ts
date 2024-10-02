import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { BoxOfficeABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetTicketPricePaidSchema = z.object({
  showId: z.string(),
  ticketId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetTicketPricePaid = z.infer<typeof GetTicketPricePaidSchema>

export const getTicketPricePaidCore = async (
  input: GetTicketPricePaid,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { chainId, showId, ticketId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint>({
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

export const useGetTicketPricePaid = (input: GetTicketPricePaid) => {
  const contextChainId = useChainId()
  const effectiveChainId = (contextChainId ?? input.chainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getTicketPricePaid', input],
    queryFn: () =>
      getTicketPricePaidCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && !!input.ticketId
  })
}
