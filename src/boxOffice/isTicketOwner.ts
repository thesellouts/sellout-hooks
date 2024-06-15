import BoxOfficeABI from '@lucidlabs/sellout-protocol/abis/BoxOffice.json'
import { useQuery } from '@tanstack/react-query'
import { Config, readContract } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { getContractAddresses, wagmiConfig } from '../config'

const IsTokenOwnerSchema = z.object({
  showId: z.string(),
  wallet: z.string(),
  tokenId: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type IsTokenOwnerType = z.infer<typeof IsTokenOwnerSchema>

export const isTokenOwner = async (input: IsTokenOwnerType) => {
  const { chainId, showId, wallet, tokenId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = IsTokenOwnerSchema.parse(input)

    const result = await readContract(wagmiConfig, {
      abi: BoxOfficeABI.abi,
      address: addresses.BoxOffice as `0x${string}`,
      functionName: 'isTokenOwner',
      args: [
        validatedInput.showId,
        validatedInput.wallet,
        validatedInput.tokenId
      ],
      chainId
    })

    return result as boolean
  } catch (err) {
    console.error('Error checking token owner:', err)
    throw err
  }
}

export const useIsTokenOwner = (input: IsTokenOwnerType) => {
  return useQuery({
    queryKey: ['isTokenOwner', input],
    queryFn: () => isTokenOwner(input)
  })
}
