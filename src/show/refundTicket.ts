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

const refundTicketCore = async (
  input: RefundTicketType,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<RefundTicketResult> => {
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

export const refundTicket = async (
  input: RefundTicketType
): Promise<RefundTicketResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return refundTicketCore(input, contractInteractor, config)
}

export const useRefundTicket = (
  input: RefundTicketType
): UseMutationResult<RefundTicketResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () => {
      if (effectiveChainId !== base.id && effectiveChainId !== baseSepolia.id) {
        throw new Error(`Unsupported chain ID: ${effectiveChainId}`)
      }
      return refundTicketCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      )
    },
    onError: error => {
      console.error('Error refunding ticket:', error)
    }
  })
}
