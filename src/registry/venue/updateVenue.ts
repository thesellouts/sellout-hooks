import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { VenueRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../../contractInteractor'

const UpdateVenueSchema = z.object({
  venueId: z.number(),
  name: z.string(),
  bio: z.string(),
  wallet: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  totalCapacity: z.number(),
  streetAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>

export interface UpdateVenueResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const updateVenueCore = async (
  input: UpdateVenueInput,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<UpdateVenueResult> => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = UpdateVenueSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: VenueRegistryABI,
      address: addresses.VenueRegistry as `0x${string}`,
      functionName: 'updateVenue',
      args: [
        validatedInput.venueId,
        validatedInput.name,
        validatedInput.bio,
        validatedInput.wallet,
        validatedInput.latitude,
        validatedInput.longitude,
        validatedInput.totalCapacity,
        validatedInput.streetAddress
      ],
      chainId
    })

    // Execute the contract interaction
    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: VenueRegistryABI as Abi,
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

export const useUpdateVenue = (
  input: UpdateVenueInput,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<UpdateVenueResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () => {
      if (effectiveChainId !== base.id && effectiveChainId !== baseSepolia.id) {
        throw new Error(`Unsupported chain ID: ${effectiveChainId}`)
      }
      return updateVenueCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      )
    },
    onError: error => {
      console.error('Error updating venue:', error)
    }
  })
}
