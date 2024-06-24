import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const RefundTicketSchema = z.object({
  showId: z.string(),
  ticketId: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type RefundTicketType = z.infer<typeof RefundTicketSchema>

export const refundTicket = async (input: RefundTicketType) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = RefundTicketSchema.parse(input)

    const { request } = await simulateContract(wagmiConfig as unknown as Config, {
      abi: ShowABI,
      address: addresses.Show as `0x${string}`,
      functionName: 'refundTicket',
      args: [validatedInput.showId, validatedInput.ticketId],
      chainId
    })

    const hash = await writeContract(wagmiConfig as unknown as Config, request)
    return {
      hash,
      getReceipt: () => waitForTransactionReceipt(wagmiConfig as unknown as Config, { hash })
    }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const useRefundTicket = () => {
  return useMutation({
    mutationFn: (input: RefundTicketType) => refundTicket(input),
    onError: error => {
      console.error('Error refunding ticket:', error)
    }
  })
}
