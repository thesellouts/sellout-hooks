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

const AcceptNominationSchema = z.object({
  name: z.string(),
  bio: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  totalCapacity: z.number(),
  streetAddress: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type AcceptVenueNomination = z.infer<typeof AcceptNominationSchema>

export interface AcceptVenueNominationResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const acceptVenueNominationCore = async (
  input: AcceptVenueNomination,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<AcceptVenueNominationResult> => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = AcceptNominationSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: VenueRegistryABI,
      address: addresses.VenueRegistry as `0x${string}`,
      functionName: 'acceptNomination',
      args: [
        validatedInput.name,
        validatedInput.bio,
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

export const useAcceptVenueNomination = (
  input: AcceptVenueNomination,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<AcceptVenueNominationResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      acceptVenueNominationCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error accepting venue nomination:', error)
    }
  })
}
