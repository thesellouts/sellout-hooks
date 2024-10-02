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

const NominateArtistSchema = z.object({
  nominee: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type NominateArtist = z.infer<typeof NominateArtistSchema>

export interface NominateArtistResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const nominateArtistCore = async (
  input: NominateArtist,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<NominateArtistResult> => {
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

export const useNominateArtist = (
  input: NominateArtist,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<NominateArtistResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      nominateArtistCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error nominating artist:', error)
    }
  })
}
