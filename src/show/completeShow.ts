import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const CompleteShowSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type CompleteShowType = z.infer<typeof CompleteShowSchema>

export interface CompleteShowResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const completeShowCore = async (
  input: CompleteShowType,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<CompleteShowResult> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = CompleteShowSchema.parse(input)

    const { request } = await simulateContract(config, {
      abi: ShowABI as Abi,
      address: addresses.Show as `0x${string}`,
      functionName: 'completeShow',
      args: [validatedInput.showId],
      chainId
    })

    const receipt = await contractInteractor.execute({
      address: request.address,
      abi: ShowABI as Abi,
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

export const completeShow = async (
  input: CompleteShowType
): Promise<CompleteShowResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return completeShowCore(input, contractInteractor, config)
}

export const useCompleteShow = (
  input: CompleteShowType
): UseMutationResult<CompleteShowResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () => {
      if (effectiveChainId !== base.id && effectiveChainId !== baseSepolia.id) {
        throw new Error(`Unsupported chain ID: ${effectiveChainId}`)
      }
      return completeShowCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      )
    },
    onError: error => {
      console.error('Error completing show:', error)
    }
  })
}
