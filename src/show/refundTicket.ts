import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const RefundTicketSchema = z.object({
  showId: z.string(),
  ticketId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type RefundTicketType = z.infer<typeof RefundTicketSchema>

export interface RefundTicketResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createRefundTicket =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (input: RefundTicketType): Promise<RefundTicketResult> => {
    const { showId, ticketId, chainId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = RefundTicketSchema.parse(input)

      const { request } = await simulateContract(config, {
        abi: ShowABI as Abi,
        address: addresses.Show as `0x${string}`,
        functionName: 'refundTicket',
        args: [validatedInput.showId, validatedInput.ticketId],
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

export const useRefundTicket = (
  input: RefundTicketType,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<RefundTicketResult, Error> => {
  const refundTicket = useMemo(
    () => createRefundTicket(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => refundTicket(input),
    onError: error => {
      console.error('Error refunding ticket:', error)
    }
  })
}
