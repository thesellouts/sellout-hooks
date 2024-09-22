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

const IsOrganizerSchema = z.object({
  user: z.string(),
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsOrganizerInput = z.infer<typeof IsOrganizerSchema>

const isOrganizerCore = async (
  input: IsOrganizerInput,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { user, showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<boolean>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'isOrganizer',
      args: [user, showId]
    })
  } catch (error) {
    console.error('Error checking if user is an organizer:', error)
    throw new Error('Failed to check if user is an organizer')
  }
}

export const isOrganizer = async (
  input: IsOrganizerInput
): Promise<boolean> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return isOrganizerCore(input, contractInteractor)
}

export const useIsOrganizer = (input: IsOrganizerInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['isOrganizer', input.user, input.showId],
    queryFn: () =>
      isOrganizerCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.user && !!input.showId
  })
}
