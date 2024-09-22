import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetShowProposalsSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowProposalsInput = z.infer<typeof GetShowProposalsSchema>

const getShowProposalsCore = async (
  input: GetShowProposalsInput,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<any>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getShowProposals',
      args: [showId]
    })
  } catch (error) {
    console.error('Error getting show proposals:', error)
    throw new Error('Failed to fetch show proposals')
  }
}

export const getShowProposals = async (
  input: GetShowProposalsInput
): Promise<any> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getShowProposalsCore(input, contractInteractor)
}

export const useGetShowProposals = (input: GetShowProposalsInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getShowProposals', input.showId],
    queryFn: () =>
      getShowProposalsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId
  })
}
