import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const WithdrawRefundSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type WithdrawRefundType = z.infer<typeof WithdrawRefundSchema>

export interface WithdrawRefundResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createWithdrawRefund =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: WithdrawRefundType): Promise<WithdrawRefundResult> => {
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

export const useWithdrawRefund = (
  input: WithdrawRefundType,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<WithdrawRefundResult, Error> => {
  const withdrawRefund = useMemo(
    () => createWithdrawRefund(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => withdrawRefund(input),
    onError: error => {
      console.error('Error withdrawing refund:', error)
    }
  })
}
