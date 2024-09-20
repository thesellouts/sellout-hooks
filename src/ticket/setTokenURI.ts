import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const SetTokenURISchema = z.object({
  showId: z.string(),
  tokenId: z.number(),
  newURI: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SetTokenURIType = z.infer<typeof SetTokenURISchema>

export interface SetTokenURIResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createSetTokenURI =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: SetTokenURIType): Promise<SetTokenURIResult> => {
    const { showId, tokenId, newURI, chainId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = SetTokenURISchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: TicketABI,
        address: addresses.Ticket as `0x${string}`,
        functionName: 'setTokenURI',
        args: [
          validatedInput.showId,
          validatedInput.tokenId,
          validatedInput.newURI
        ],
        chainId
      })

      // Execute the contract interaction
      const receipt = await contractInteractor.execute({
        address: request.address,
        abi: TicketABI as Abi,
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

export const useSetTokenURI = (
  input: SetTokenURIType,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<SetTokenURIResult, Error> => {
  const setTokenURI = useMemo(
    () => createSetTokenURI(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => setTokenURI(input),
    onError: error => {
      console.error('Error setting token URI:', error)
    }
  })
}
