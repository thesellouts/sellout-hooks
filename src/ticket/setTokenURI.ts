import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const SetTokenURISchema = z.object({
  showId: z.string(),
  tokenId: z.number(),
  newURI: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SetTokenURIType = z.infer<typeof SetTokenURISchema>

export interface SetTokenURIResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

const setTokenURICore = async (
  input: SetTokenURIType,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<SetTokenURIResult> => {
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

export const setTokenURI = async (
  input: SetTokenURIType
): Promise<SetTokenURIResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return setTokenURICore(input, contractInteractor, config)
}

export const useSetTokenURI = (
  input: SetTokenURIType
): UseMutationResult<SetTokenURIResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

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
