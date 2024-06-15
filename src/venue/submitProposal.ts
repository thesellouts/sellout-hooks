import { useMutation } from '@tanstack/react-query'
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora, zoraSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const SubmitProposalSchema = z.object({
  showId: z.string(),
  venueId: z.number(),
  proposedDates: z.array(z.number()),
  paymentToken: z.string(),
  paymentAmount: z.string().optional(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type SubmitProposal = z.infer<typeof SubmitProposalSchema>

export const submitProposal = async (input: SubmitProposal) => {
  const {
    showId,
    venueId,
    proposedDates,
    paymentToken,
    paymentAmount,
    chainId
  } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = SubmitProposalSchema.parse(input)

    const { request } = await simulateContract(wagmiConfig, {
      abi: VenueABI,
      address: addresses.Venue as `0x${string}`,
      functionName: 'submitProposal',
      args: [showId, venueId, proposedDates, paymentToken],
      chainId
    })

    const hash = await writeContract(wagmiConfig, {
      ...request,
      value: paymentAmount ? BigInt(paymentAmount) : BigInt(0)
    })
    return {
      hash,
      getReceipt: () => waitForTransactionReceipt(wagmiConfig, { hash })
    }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const useSubmitProposal = () => {
  return useMutation({
    mutationFn: (input: SubmitProposal) => submitProposal(input),
    onError: error => {
      console.error('Error executing submitProposal:', error)
    }
  })
}
