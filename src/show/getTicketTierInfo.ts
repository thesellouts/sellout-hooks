import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetTicketTierInfoSchema = z.object({
  showId: z.string(),
  tierIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetTicketTierInfoInput = z.infer<typeof GetTicketTierInfoSchema>

const getTicketTierInfoCore = async (
  input: GetTicketTierInfoInput,
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

export const getTicketTierInfo = async (input: GetTicketTierInfoInput) => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getTicketTierInfoCore(input, contractInteractor)
}

export const useGetTicketTierInfo = (input: GetTicketTierInfoInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
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
