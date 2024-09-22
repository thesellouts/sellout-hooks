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

const GetShowToVenueProxySchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowToVenueProxyInput = z.infer<typeof GetShowToVenueProxySchema>

const getShowToVenueProxyCore = async (
  input: GetShowToVenueProxyInput,
  contractInteractor: ContractInteractor
): Promise<`0x${string}`> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<`0x${string}`>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getShowToVenueProxy',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading venue proxy:', error)
    throw new Error('Failed to fetch venue proxy')
  }
}

export const getShowToVenueProxy = async (
  input: GetShowToVenueProxyInput
): Promise<`0x${string}`> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getShowToVenueProxyCore(input, contractInteractor)
}

export const useGetShowToVenueProxy = (input: GetShowToVenueProxyInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getShowToVenueProxy', input.showId],
    queryFn: () =>
      getShowToVenueProxyCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId
  })
}
