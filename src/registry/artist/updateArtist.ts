import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { ArtistRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
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
  config: Config
): Promise<UpdateArtistResult> => {
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

export const updateArtist = async (
  input: UpdateArtist
): Promise<UpdateArtistResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return updateArtistCore(input, contractInteractor, config)
}

export const useUpdateArtist = (
  input: UpdateArtist
): UseMutationResult<UpdateArtistResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

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
