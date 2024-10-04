import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const HasTicketSchema = z.object({
  wallet: z.string(),
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type HasTicketInput = z.infer<typeof HasTicketSchema>

export const hasTicketCore = async (
  input: HasTicketInput,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { wallet, showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'hasTicket',
      args: [wallet, showId]
    })
  } catch (error) {
    console.error('Error checking ticket ownership:', error)
    throw new Error('Failed to check ticket ownership')
  }
}

type UseHasTicketOptions = Omit<
  UseQueryOptions<boolean, Error, boolean, [string, string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useHasTicket = (
  input: HasTicketInput,
  options?: UseHasTicketOptions
): UseQueryResult<boolean, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['hasTicket', input.wallet, input.showId],
    queryFn: () =>
      hasTicketCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled:
      enabled !== undefined
        ? enabled && !!input.wallet && !!input.showId
        : !!input.wallet && !!input.showId,
    ...queryOptions
  })
}
