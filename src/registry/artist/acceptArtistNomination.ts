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

const AcceptNominationSchema = z.object({
  name: z.string(),
  bio: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type AcceptArtistNomination = z.infer<typeof AcceptNominationSchema>

export interface AcceptArtistNominationResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const acceptArtistNominationCore = async (
  input: AcceptArtistNomination,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<AcceptArtistNominationResult> => {
  const { name, bio, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = AcceptNominationSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: ArtistRegistryABI,
      address: addresses.ArtistRegistry as `0x${string}`,
      functionName: 'acceptNomination',
      args: [validatedInput.name, validatedInput.bio],
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

export const useAcceptArtistNomination = (
  input: AcceptArtistNomination,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<AcceptArtistNominationResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      acceptArtistNominationCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error accepting artist nomination:', error)
    }
  })
}
