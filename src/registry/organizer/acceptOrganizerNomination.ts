import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'

const AcceptNominationSchema = z.object({
  name: z.string(),
  bio: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type AcceptOrganizerNominationInput = z.infer<
  typeof AcceptNominationSchema
>

export interface AcceptOrganizerNominationResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createAcceptOrganizerNomination =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (
    input: AcceptOrganizerNominationInput
  ): Promise<AcceptOrganizerNominationResult> => {
    const { chainId, name, bio } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = AcceptNominationSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: OrganizerRegistryABI,
        address: addresses.OrganizerRegistry as `0x${string}`,
        functionName: 'acceptNomination',
        args: [validatedInput.name, validatedInput.bio],
        chainId
      })

      // Execute the contract interaction
      const receipt = await contractInteractor.execute({
        address: request.address,
        abi: OrganizerRegistryABI as Abi,
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

export const useAcceptOrganizerNomination = (
  input: AcceptOrganizerNominationInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<AcceptOrganizerNominationResult, Error> => {
  const acceptOrganizerNomination = useMemo(
    () => createAcceptOrganizerNomination(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => acceptOrganizerNomination(input),
    onError: error => {
      console.error('Error accepting nomination:', error)
    }
  })
}
