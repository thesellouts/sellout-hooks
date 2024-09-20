import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const VoteForEmergencyRefundSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type VoteForEmergencyRefundType = z.infer<
  typeof VoteForEmergencyRefundSchema
>

export interface VoteForEmergencyRefundResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createVoteForEmergencyRefund =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (
    input: VoteForEmergencyRefundType
  ): Promise<VoteForEmergencyRefundResult> => {
    const { showId, chainId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = VoteForEmergencyRefundSchema.parse(input)

      const { request } = await simulateContract(config, {
        abi: ShowABI as Abi,
        address: addresses.Show as `0x${string}`,
        functionName: 'voteForEmergencyRefund',
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

export const useVoteForEmergencyRefund = (
  input: VoteForEmergencyRefundType,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<VoteForEmergencyRefundResult, Error> => {
  const voteForEmergencyRefund = useMemo(
    () => createVoteForEmergencyRefund(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => voteForEmergencyRefund(input),
    onError: error => {
      console.error('Error voting for emergency refund:', error)
    }
  })
}
