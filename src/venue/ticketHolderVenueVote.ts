import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { VenueABI } from '../abis'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'
import { AddressSchema } from '../utils'

const TicketHolderVenueVoteSchema = z.object({
  showId: z.string(),
  venueProxyAddress: AddressSchema,
  proposalIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type TicketHolderVenueVote = z.infer<typeof TicketHolderVenueVoteSchema>

export interface TicketHolderVenueVoteResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const ticketHolderVenueVoteCore = async (
  input: TicketHolderVenueVote,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<TicketHolderVenueVoteResult> => {
  try {
    const validatedInput = TicketHolderVenueVoteSchema.parse(input)
    const account =
      options?.smart !== false
        ? contractInteractor.smartAccountAddress
        : undefined

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: VenueABI,
      address: validatedInput.venueProxyAddress as `0x${string}`,
      functionName: 'ticketHolderVenueVote',
      args: [validatedInput.showId, validatedInput.proposalIndex],
      chainId: validatedInput.chainId,
      account
    })

    // Execute the contract interaction
    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: VenueABI as Abi,
        functionName: request.functionName,
        args: request.args ? [...request.args] : undefined
      },
      options
    )

    return {
      hash: receipt.transactionHash,
      receipt
    }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const useTicketHolderVenueVote = (
  input: TicketHolderVenueVote,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<TicketHolderVenueVoteResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () =>
      ticketHolderVenueVoteCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error executing ticketHolderVenueVote:', error)
    }
  })
}
