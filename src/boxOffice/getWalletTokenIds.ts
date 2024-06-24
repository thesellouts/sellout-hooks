import BoxOfficeABI from '@lucidlabs/sellout-protocol/abis/BoxOffice.json'
import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { getContractAddresses, wagmiConfig } from '../config'

const GetWalletTokenIdsSchema = z.object({
  showId: z.string(),
  address: z.string().optional(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetWalletTokenIdsType = z.infer<typeof GetWalletTokenIdsSchema>

export const getWalletTokenIds = async (input: GetWalletTokenIdsType) => {
  const { chainId, showId, address } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = GetWalletTokenIdsSchema.parse(input)

    const result = await readContract(wagmiConfig as unknown as Config, {
      abi: BoxOfficeABI.abi,
      address: addresses.BoxOffice as `0x${string}`,
      functionName: 'getWalletTokenIds',
      args: [validatedInput.showId, validatedInput.address],
      chainId
    })

    return result as bigint[]
  } catch (err) {
    console.error('Error fetching wallet token IDs:', err)
    throw err
  }
}

export const useGetWalletTokenIds = (input: GetWalletTokenIdsType) => {
  return useQuery({
    queryKey: ['getWalletTokenIds', input],
    queryFn: () => getWalletTokenIds(input),
    enabled: !!input.address
  })
}
