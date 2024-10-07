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

const SetTokenURISchema = z.object({
  showId: z.string(),
  tokenId: z.number(),
  newURI: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SetTokenURI = z.infer<typeof SetTokenURISchema>

export interface SetTokenURIResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const setTokenURICore = async (
  input: SetTokenURI,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<SetTokenURIResult> => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = SetTokenURISchema.parse(input)
    const account =
      options?.smart !== false
        ? contractInteractor.smartAccountAddress
        : undefined

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
      chainId,
      account
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

export const useSetTokenURI = (
  input: SetTokenURI,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<SetTokenURIResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      setTokenURICore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error setting token URI:', error)
    }
  })
}
