import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const DeregisterArtistSchema = z.object({
  artistId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type DeregisterArtistInput = z.infer<typeof DeregisterArtistSchema>

export interface DeregisterArtistResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createDeregisterArtist =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: DeregisterArtistInput): Promise<DeregisterArtistResult> => {
    const { chainId, artistId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = DeregisterArtistSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: ArtistRegistryABI,
        address: addresses.ArtistRegistry as `0x${string}`,
        functionName: 'deregisterArtist',
        args: [validatedInput.artistId],
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

export const useDeregisterArtist = (
  input: DeregisterArtistInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<DeregisterArtistResult, Error> => {
  const deregisterArtist = useMemo(
    () => createDeregisterArtist(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => deregisterArtist(input),
    onError: error => {
      console.error('Error deregistering artist:', error)
    }
  })
}
