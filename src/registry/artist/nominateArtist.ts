import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const NominateArtistSchema = z.object({
  nominee: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type NominateArtistInput = z.infer<typeof NominateArtistSchema>

export interface NominateArtistResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createNominateArtist =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: NominateArtistInput): Promise<NominateArtistResult> => {
    const { chainId, nominee } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = NominateArtistSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: ArtistRegistryABI,
        address: addresses.ArtistRegistry as `0x${string}`,
        functionName: 'nominate',
        args: [validatedInput.nominee],
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

export const useNominateArtist = (
  input: NominateArtistInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<NominateArtistResult, Error> => {
  const nominateArtist = useMemo(
    () => createNominateArtist(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => nominateArtist(input),
    onError: error => {
      console.error('Error nominating artist:', error)
    }
  })
}
