import { useQuery } from '@tanstack/react-query'
import BoxOfficeABI from '@thesellouts/sellout-protocol/abis/BoxOffice.json'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { getContractAddresses } from '../config'

const GetWalletTokenIdsSchema = z.object({
  showId: z.string(),
  address: z.string().optional(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type GetWalletTokenIdsType = z.infer<typeof GetWalletTokenIdsSchema>

export const getWalletTokenIds = async (
  input: GetWalletTokenIdsType,
  config: Config
) => {
  const { chainId, showId, address } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = GetWalletTokenIdsSchema.parse(input)

    const result = await readContract(config, {
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

export const useGetWalletTokenIds = (
  input: GetWalletTokenIdsType,
  config: Config
) => {
  return useQuery({
    queryKey: ['getWalletTokenIds', input],
    queryFn: () => getWalletTokenIds(input, config),
    enabled: !!input.address
  })
}
