import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const SetDefaultURIForShowSchema = z.object({
  showId: z.string(),
  newDefaultURI: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SetDefaultURIForShow = z.infer<typeof SetDefaultURIForShowSchema>

export interface SetDefaultURIForShowResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const setDefaultURIForShowCore = async (
  input: SetDefaultURIForShow,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
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
    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: TicketABI as Abi,
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

export const useSetDefaultURIForShow = (
  input: SetDefaultURIForShow,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<SetDefaultURIForShowResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (contextChainId ?? input.chainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      setDefaultURIForShowCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error setting default URI for show:', error)
    }
  })
}
