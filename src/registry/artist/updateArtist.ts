import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const UpdateArtistSchema = z.object({
  artistId: z.number(),
  name: z.string(),
  bio: z.string(),
  wallet: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type UpdateArtistInput = z.infer<typeof UpdateArtistSchema>

export interface UpdateArtistResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createUpdateArtist =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: UpdateArtistInput): Promise<UpdateArtistResult> => {
    const { chainId, artistId, name, bio, wallet } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = UpdateArtistSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: ArtistRegistryABI,
        address: addresses.ArtistRegistry as `0x${string}`,
        functionName: 'updateArtist',
        args: [
          validatedInput.artistId,
          validatedInput.name,
          validatedInput.bio,
          validatedInput.wallet
        ],
        chainId
      })

      // Execute the contract interaction
      const receipt = await contractInteractor.execute({
        address: request.address,
        abi: ArtistRegistryABI as Abi,
        functionName: request.functionName,
        args: request.args ? [...request.args] : undefined
      })

      return {
        hash: receipt.transactionHash,
        receipt
      }
    } catch (err) {
      console.error('Validation or Execution Error:', err)
      throw err
    }
  }

export const useUpdateArtist = (
  input: UpdateArtistInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<UpdateArtistResult, Error> => {
  const updateArtist = useMemo(
    () => createUpdateArtist(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => updateArtist(input),
    onError: error => {
      console.error('Error updating artist:', error)
    }
  })
}
