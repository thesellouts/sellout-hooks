import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

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

const createCompleteShow =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: CompleteShowType): Promise<CompleteShowResult> => {
    const { chainId, showId } = input
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

export const useCompleteShow = (
  input: CompleteShowType,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<CompleteShowResult, Error> => {
  const completeShow = useMemo(
    () => createCompleteShow(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => completeShow(input),
    onError: error => {
      console.error('Error completing show:', error)
    }
  })
}
