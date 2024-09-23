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

const IsTicketOwnerSchema = z.object({
  showId: z.string(),
  wallet: z.string(),
  tokenId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsTicketOwnerInput = z.infer<typeof IsTicketOwnerSchema>

export const isTicketOwnerCore = async (
  input: IsTicketOwnerInput,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { chainId, showId, wallet, tokenId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<boolean>({
      abi: BoxOfficeABI as Abi,
      address: addresses.BoxOffice as `0x${string}`,
      functionName: 'isTokenOwner',
      args: [showId, wallet, tokenId]
    })
  } catch (err) {
    console.error('Error checking token owner:', err)
    throw err
  }
}

export const isTicketOwner = async (
  input: IsTicketOwnerInput
): Promise<boolean> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return isTicketOwnerCore(input, contractInteractor)
}

export const useIsTicketOwner = (input: IsTicketOwnerInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['isTicketOwner', input],
    queryFn: () =>
      isTicketOwnerCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && !!input.wallet && input.tokenId !== undefined
  })
}
