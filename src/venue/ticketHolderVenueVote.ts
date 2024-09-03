import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'

const TicketHolderVenueVoteSchema = z.object({
  showId: z.string(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type TicketHolderVenueVote = z.infer<typeof TicketHolderVenueVoteSchema>

export const ticketHolderVenueVote = async (
  input: TicketHolderVenueVote,
  config: Config
) => {
  const { showId, proposalIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = TicketHolderVenueVoteSchema.parse(input)

    const { request } = await simulateContract(config, {
      abi: VenueABI,
      address: addresses.Venue as `0x${string}`,
      functionName: 'ticketHolderVenueVote',
      args: [showId, proposalIndex],
      chainId
    })

    const hash = await writeContract(config, request)
    return {
      hash,
      getReceipt: () => waitForTransactionReceipt(config, { hash })
    }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const useTicketHolderVenueVote = (
  input: TicketHolderVenueVote,
  config: Config
) => {
  return useMutation({
    mutationFn: () => ticketHolderVenueVote(input, config),
    onError: error => {
      console.error('Error executing ticketHolderVenueVote:', error)
    }
  })
}
