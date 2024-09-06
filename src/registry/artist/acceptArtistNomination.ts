import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { base, baseSepolia, sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'

const AcceptNominationSchema = z.object({
  name: z.string(),
  bio: z.string(),
  chainId: z.union([
    z.literal(base.id),
    z.literal(baseSepolia.id)
  ])
})

export type AcceptArtistNominationInput = z.infer<typeof AcceptNominationSchema>

export const acceptArtistNomination = async (
  input: AcceptArtistNominationInput,
  config: Config
) => {
  const { chainId, name, bio } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = AcceptNominationSchema.parse(input)

  const { request } = await simulateContract(config, {
    abi: ArtistRegistryABI,
    address: addresses.ArtistRegistry as `0x${string}`,
    functionName: 'acceptNomination',
    args: [validatedInput.name, validatedInput.bio],
    chainId
  })

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useAcceptArtistNomination = (
  input: AcceptArtistNominationInput,
  config: Config
) => {
  return useMutation({
    mutationFn: () => acceptArtistNomination(input, config),
    onError: error => {
      console.error('Error accepting nomination:', error)
    }
  })
}
