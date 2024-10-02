import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetRefundsSchema = z.object({
  user: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetRefunds = z.infer<typeof GetRefundsSchema>

export const getRefundsCore = async (
  input: GetRefunds,
  contractInteractor: ContractInteractor
): Promise<any> => {
  const { user, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<any>({
      address: addresses.Venue as `0x${string}`,
      abi: VenueABI as Abi,
      functionName: 'getRefunds',
      args: [user]
    })
  } catch (error) {
    console.error('Error getting refunds:', error)
    throw new Error('Failed to fetch refunds')
  }
}

export const useGetRefunds = (input: GetRefunds) => {
  const contextChainId = useChainId()
  const effectiveChainId = (contextChainId ?? input.chainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useQuery({
    queryKey: ['getRefunds', input.user],
    queryFn: () =>
      getRefundsCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: !!input.user
  })
}
