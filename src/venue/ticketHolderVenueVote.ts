import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const TicketHolderVenueVoteSchema = z.object({
  showId: z.string(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type TicketHolderVenueVote = z.infer<typeof TicketHolderVenueVoteSchema>

export const ticketHolderVenueVote = async (input: TicketHolderVenueVote) => {
  const { showId, proposalIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = TicketHolderVenueVoteSchema.parse(input)

    const { request } = await simulateContract(
      wagmiConfig as unknown as Config,
      {
        abi: VenueABI,
        address: addresses.Venue as `0x${string}`,
        functionName: 'ticketHolderVenueVote',
        args: [showId, proposalIndex],
        chainId
      }
    )

    const hash = await writeContract(wagmiConfig as unknown as Config, request)
    return {
      hash,
      getReceipt: () =>
        waitForTransactionReceipt(wagmiConfig as unknown as Config, { hash })
    }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const useTicketHolderVenueVote = () => {
  return useMutation({
    mutationFn: (input: TicketHolderVenueVote) => ticketHolderVenueVote(input),
    onError: error => {
      console.error('Error executing ticketHolderVenueVote:', error)
    }
  })
}
