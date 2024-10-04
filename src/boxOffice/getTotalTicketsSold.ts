import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { BoxOfficeABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
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

type UseGetTotalTicketsSoldOptions = Omit<
  UseQueryOptions<bigint, Error, bigint, [string, GetTotalTicketsSold]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetTotalTicketsSold = (
  input: GetTotalTicketsSold,
  options?: UseGetTotalTicketsSoldOptions
) => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getTotalTicketsSold', input],
    queryFn: () =>
      getTotalTicketsSoldCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
