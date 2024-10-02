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

const GetTotalTicketsSoldSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetTotalTicketsSold = z.infer<typeof GetTotalTicketsSoldSchema>

export const getTotalTicketsSoldCore = async (
  input: GetTotalTicketsSold,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { chainId, showId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint>({
      abi: BoxOfficeABI as Abi,
      address: addresses.BoxOffice as `0x${string}`,
      functionName: 'getTotalTicketsSold',
      args: [showId]
    })
  } catch (err) {
    console.error('Error fetching total tickets sold:', err)
    throw err
  }
}

export const useGetTotalTicketsSold = (input: GetTotalTicketsSold) => {
  const contextChainId = useChainId()
  const effectiveChainId = (contextChainId ?? input.chainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getTotalTicketsSold', input],
    queryFn: () =>
      getTotalTicketsSoldCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId
  })
}
