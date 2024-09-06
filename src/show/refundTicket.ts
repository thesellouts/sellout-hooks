import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'

const RefundTicketSchema = z.object({
  showId: z.string(),
  ticketId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type RefundTicketType = z.infer<typeof RefundTicketSchema>

export const refundTicket = async (input: RefundTicketType, config: Config) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = RefundTicketSchema.parse(input)

    const { request } = await simulateContract(config, {
      abi: ShowABI,
      address: addresses.Show as `0x${string}`,
      functionName: 'refundTicket',
      args: [validatedInput.showId, validatedInput.ticketId],
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

export const useRefundTicket = (input: RefundTicketType, config: Config) => {
  return useMutation({
    mutationFn: () => refundTicket(input, config),
    onError: error => {
      console.error('Error refunding ticket:', error)
    }
  })
}
