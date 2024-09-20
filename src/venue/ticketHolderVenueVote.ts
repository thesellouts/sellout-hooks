import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const TicketHolderVenueVoteSchema = z.object({
  showId: z.string(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type TicketHolderVenueVote = z.infer<typeof TicketHolderVenueVoteSchema>

export interface TicketHolderVenueVoteResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const createTicketHolderVenueVote =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (
    input: TicketHolderVenueVote
  ): Promise<TicketHolderVenueVoteResult> => {
    const { showId, proposalIndex, chainId } = input
    const addresses = getContractAddresses(chainId)

    try {
      const validatedInput = TicketHolderVenueVoteSchema.parse(input)

      // Simulate the contract call
      const { request } = await simulateContract(config, {
        abi: VenueABI,
        address: addresses.Venue as `0x${string}`,
        functionName: 'ticketHolderVenueVote',
        args: [showId, proposalIndex],
        chainId
      })

      // Execute the contract interaction
      const receipt = await contractInteractor.execute({
        address: request.address,
        abi: VenueABI as Abi,
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

export const useTicketHolderVenueVote = (
  input: TicketHolderVenueVote,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<TicketHolderVenueVoteResult, Error> => {
  const ticketHolderVenueVote = useMemo(
    () => createTicketHolderVenueVote(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => ticketHolderVenueVote(input),
    onError: error => {
      console.error('Error executing ticketHolderVenueVote:', error)
    }
  })
}
