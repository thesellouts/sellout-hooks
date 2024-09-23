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

const GetWalletTokenIdsSchema = z.object({
  showId: z.string(),
  address: z.string().optional(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetWalletTokenIdsInput = z.infer<typeof GetWalletTokenIdsSchema>

export const getWalletTokenIdsCore = async (
  input: GetWalletTokenIdsInput,
  contractInteractor: ContractInteractor
): Promise<bigint[]> => {
  const { chainId, showId, address } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint[]>({
      abi: BoxOfficeABI as Abi,
      address: addresses.BoxOffice as `0x${string}`,
      functionName: 'getWalletTokenIds',
      args: [showId, address]
    })
  } catch (err) {
    console.error('Error fetching wallet token IDs:', err)
    throw err
  }
}

export const getWalletTokenIds = async (
  input: GetWalletTokenIdsInput
): Promise<bigint[]> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return getWalletTokenIdsCore(input, contractInteractor)
}

export const useGetWalletTokenIds = (input: GetWalletTokenIdsInput) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getWalletTokenIds', input],
    queryFn: () =>
      getWalletTokenIdsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId && !!input.address
  })
}
