import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { BoxOfficeABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const GetWalletTokenIdsSchema = z.object({
  showId: z.string(),
  address: z.string().optional(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetWalletTokenIdsInput = z.infer<typeof GetWalletTokenIdsSchema>

export const getWalletTokenIds = async (
  input: GetWalletTokenIdsInput,
  contractInteractor: ContractInteractor
): Promise<bigint[]> => {
  const { chainId, showId, address } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
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

export const useGetWalletTokenIds = (
  input: GetWalletTokenIdsInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getWalletTokenIds', input],
    queryFn: () => getWalletTokenIds(input, contractInteractor),
    enabled: !!input.showId && !!input.address
  })
}
