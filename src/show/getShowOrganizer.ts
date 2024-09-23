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

const GetShowOrganizerSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowOrganizer = z.infer<typeof GetShowOrganizerSchema>

export const getShowOrganizerCore = async (
  input: GetShowOrganizer,
  contractInteractor: ContractInteractor
): Promise<string> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<string>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getOrganizer',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading organizer:', error)
    throw new Error('Failed to fetch organizer')
  }
}

export const getShowOrganizer = async (
  input: GetShowOrganizer
): Promise<string> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getShowOrganizerCore(input, contractInteractor)
}

export const useGetShowOrganizer = (input: GetShowOrganizer) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getOrganizer', input.showId],
    queryFn: () =>
      getShowOrganizerCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId
  })
}
