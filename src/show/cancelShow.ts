import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const CancelShowSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type CancelShowType = z.infer<typeof CancelShowSchema>

export interface CancelShowResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createCancelShow =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: CancelShowType): Promise<CancelShowResult> => {
    const { chainId, showId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = CancelShowSchema.parse(input)

      const { request } = await simulateContract(config, {
        abi: ShowABI as Abi,
        address: addresses.Show as `0x${string}`,
        functionName: 'cancelShow',
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

export const useCancelShow = (
  input: CancelShowType,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<CancelShowResult, Error> => {
  const cancelShow = useMemo(
    () => createCancelShow(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => cancelShow(input),
    onError: error => {
      console.error('Error canceling show:', error)
    }
  })
}
