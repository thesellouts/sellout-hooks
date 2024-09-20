import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowVaultABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetShowVaultSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowVaultInput = z.infer<typeof GetShowVaultSchema>

export const getShowVault = async (
  input: GetShowVaultInput,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return (await contractInteractor.read({
      address: addresses.ShowVault as `0x${string}`,
      abi: ShowVaultABI as Abi,
      functionName: 'showVault',
      args: [showId]
    })) as bigint
  } catch (error) {
    console.error('Error getting show vault balance:', error)
    throw new Error('Failed to get show vault balance')
  }
}

export const useGetShowVault = (
  input: GetShowVaultInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getShowVault', input.showId],
    queryFn: () => getShowVault(input, contractInteractor),
    enabled: !!input.showId
  })
}
