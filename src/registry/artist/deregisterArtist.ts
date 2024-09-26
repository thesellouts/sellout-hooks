import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../../contractInteractor'

const DeregisterArtistSchema = z.object({
  artistId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type DeregisterArtist = z.infer<typeof DeregisterArtistSchema>

export interface DeregisterArtistResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const deregisterArtistCore = async (
  input: DeregisterArtist,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<DeregisterArtistResult> => {
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
    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: ArtistRegistryABI as Abi,
        functionName: request.functionName,
        args: request.args ? [...request.args] : undefined
      },
      options
    )

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
  input: DeregisterArtist,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<DeregisterArtistResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      deregisterArtistCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error deregistering artist:', error)
    }
  })
}
