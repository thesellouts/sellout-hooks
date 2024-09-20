import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const PayoutSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type PayoutType = z.infer<typeof PayoutSchema>

export interface PayoutResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createPayout =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: PayoutType): Promise<PayoutResult> => {
    const { showId, chainId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = PayoutSchema.parse(input)

      const { request } = await simulateContract(config, {
        abi: ShowABI as Abi,
        address: addresses.Show as `0x${string}`,
        functionName: 'payout',
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

export const usePayout = (
  input: PayoutType,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<PayoutResult, Error> => {
  const payout = useMemo(
    () => createPayout(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => payout(input),
    onError: error => {
      console.error('Error executing payout:', error)
    }
  })
}
