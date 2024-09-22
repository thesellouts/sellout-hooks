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

const GetTotalTicketsSoldSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetTotalTicketsSoldInput = z.infer<typeof GetTotalTicketsSoldSchema>

const getTotalTicketsSoldCore = async (
  input: GetTotalTicketsSoldInput,
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

export const getTotalTicketsSold = async (
  input: GetTotalTicketsSoldInput
): Promise<bigint> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getTotalTicketsSoldCore(input, contractInteractor)
}

export const useGetTotalTicketsSold = (input: GetTotalTicketsSoldInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getTotalTicketsSold', input],
    queryFn: () =>
      getTotalTicketsSoldCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId
  })
}
