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

const GetShowToTicketProxySchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowToTicketProxyInput = z.infer<
  typeof GetShowToTicketProxySchema
>

export const getShowToTicketProxyCore = async (
  input: GetShowToTicketProxyInput,
  contractInteractor: ContractInteractor
): Promise<`0x${string}`> => {
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

export const getShowToTicketProxy = async (
  input: GetShowToTicketProxyInput
): Promise<`0x${string}`> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getShowToTicketProxyCore(input, contractInteractor)
}

export const useGetShowToTicketProxy = (input: GetShowToTicketProxyInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getShowToTicketProxy', input.showId],
    queryFn: () =>
      getShowToTicketProxyCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId
  })
}
