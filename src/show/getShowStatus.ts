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

const GetShowStatusSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowStatus = z.infer<typeof GetShowStatusSchema>

export const getShowStatusCore = async (
  input: GetShowStatus,
  contractInteractor: ContractInteractor
): Promise<number> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<number>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getShowStatus',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading show status:', error)
    throw new Error('Failed to fetch show status')
  }
}

export const useGetShowStatus = (input: GetShowStatus) => {
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getShowStatus', input.showId],
    queryFn: () =>
      getShowStatusCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.showId
  })
}
