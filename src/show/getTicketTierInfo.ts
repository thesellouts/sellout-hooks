import { useQuery } from '@tanstack/react-query'
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

const GetTicketTierInfoSchema = z.object({
  showId: z.string(),
  tierIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetTicketTierInfo = z.infer<typeof GetTicketTierInfoSchema>

export const getTicketTierInfoCore = async (
  input: GetTicketTierInfo,
  contractInteractor: ContractInteractor
) => {
  const { showId, tierIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getTicketTierInfo',
      args: [showId, tierIndex]
    })
  } catch (error) {
    console.error('Error reading ticket tier info:', error)
    throw new Error('Failed to fetch ticket tier info')
  }
}

export const useGetTicketTierInfo = (input: GetTicketTierInfo) => {
  const contextChainId = useChainId()
  const effectiveChainId = (contextChainId ?? input.chainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getTicketTierInfo', input.showId, input.tierIndex],
    queryFn: () =>
      getTicketTierInfoCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && input.tierIndex !== undefined
  })
}
