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

const UpdateArtistSchema = z.object({
  artistId: z.number(),
  name: z.string(),
  bio: z.string(),
  wallet: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type UpdateArtist = z.infer<typeof UpdateArtistSchema>

export interface UpdateArtistResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const updateArtistCore = async (
  input: UpdateArtist,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<UpdateArtistResult> => {
  const { chainId, artistId, name, bio, wallet } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = UpdateArtistSchema.parse(input)
    const account =
      options?.smart !== false
        ? contractInteractor.smartAccountAddress
        : undefined

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
      chainId,
      account
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

export const useUpdateArtist = (
  input: UpdateArtist,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<UpdateArtistResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      updateArtistCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error updating artist:', error)
    }
  })
}
