import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const RefundBribeSchema = z.object({
  showId: z.string(),
  venueId: z.number(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type RefundBribeType = z.infer<typeof RefundBribeSchema>

export interface RefundBribeResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createRefundBribe =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: RefundBribeType): Promise<RefundBribeResult> => {
    const { showId, venueId, proposalIndex, chainId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = RefundBribeSchema.parse(input)

      const { request } = await simulateContract(config, {
        abi: ShowABI as Abi,
        address: addresses.Show as `0x${string}`,
        functionName: 'refundBribe',
        args: [
          validatedInput.showId,
          validatedInput.venueId,
          validatedInput.proposalIndex
        ],
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

export const useRefundBribe = (
  input: RefundBribeType,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<RefundBribeResult, Error> => {
  const refundBribe = useMemo(
    () => createRefundBribe(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => refundBribe(input),
    onError: error => {
      console.error('Error refunding bribe:', error)
    }
  })
}
