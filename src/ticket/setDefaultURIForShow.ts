import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const SetDefaultURIForShowSchema = z.object({
  showId: z.string(),
  newDefaultURI: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SetDefaultURIForShowType = z.infer<
  typeof SetDefaultURIForShowSchema
>

export interface SetDefaultURIForShowResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createSetDefaultURIForShow =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (
    input: SetDefaultURIForShowType
  ): Promise<SetDefaultURIForShowResult> => {
    const { showId, newDefaultURI, chainId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = SetDefaultURIForShowSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: TicketABI,
        address: addresses.Ticket as `0x${string}`,
        functionName: 'setDefaultURIForShow',
        args: [validatedInput.showId, validatedInput.newDefaultURI],
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

export const useSetDefaultURIForShow = (
  input: SetDefaultURIForShowType,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<SetDefaultURIForShowResult, Error> => {
  const setDefaultURIForShow = useMemo(
    () => createSetDefaultURIForShow(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => setDefaultURIForShow(input),
    onError: error => {
      console.error('Error setting default URI for show:', error)
    }
  })
}
