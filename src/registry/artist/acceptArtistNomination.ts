import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses, wagmiConfig } from '../../config'

const AcceptNominationSchema = z.object({
  name: z.string(),
  bio: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type AcceptArtistNominationInput = z.infer<typeof AcceptNominationSchema>

export const acceptArtistNomination = async (
  input: AcceptArtistNominationInput
) => {
  const { chainId, name, bio } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = AcceptNominationSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig, {
    abi: ArtistRegistryABI,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'acceptNomination',
    args: [validatedInput.name, validatedInput.bio],
    chainId
  })

  const hash = await writeContract(wagmiConfig, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(wagmiConfig, { hash })
  }
}

export const useAcceptArtistNomination = () => {
  return useMutation({
    mutationFn: (input: AcceptArtistNominationInput) =>
      acceptArtistNomination(input),
    onError: error => {
      console.error('Error accepting nomination:', error)
    }
  })
}
