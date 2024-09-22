import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi, TransactionReceipt } from 'viem'
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

const WithdrawRefundSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type WithdrawRefundType = z.infer<typeof WithdrawRefundSchema>

export interface WithdrawRefundResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

const withdrawRefundCore = async (
  input: WithdrawRefundType,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<WithdrawRefundResult> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = WithdrawRefundSchema.parse(input)

    const { request } = await simulateContract(config, {
      abi: ShowABI as Abi,
      address: addresses.Show as `0x${string}`,
      functionName: 'withdrawRefund',
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

export const withdrawRefund = async (
  input: WithdrawRefundType
): Promise<WithdrawRefundResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return withdrawRefundCore(input, contractInteractor, config)
}

export const useWithdrawRefund = (
  input: WithdrawRefundType
): UseMutationResult<WithdrawRefundResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () => {
      if (effectiveChainId !== base.id && effectiveChainId !== baseSepolia.id) {
        throw new Error(`Unsupported chain ID: ${effectiveChainId}`)
      }
      return withdrawRefundCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      )
    },
    onError: error => {
      console.error('Error withdrawing refund:', error)
    }
  })
}
