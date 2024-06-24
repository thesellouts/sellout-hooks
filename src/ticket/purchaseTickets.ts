import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { wagmiConfig } from '../config'
import { AddressSchema, NULL_ADDRESS } from '../utils'

const PurchaseTicketsSchema = z.object({
  ticketProxy: AddressSchema,
  showId: z.string(),
  tierIndex: z.number(),
  quantity: z.number(),
  paymentToken: AddressSchema,
  value: z.bigint().optional(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type PurchaseTicketsType = z.infer<typeof PurchaseTicketsSchema>

export const purchaseTickets = async (input: PurchaseTicketsType) => {
  const {
    ticketProxy,
    showId,
    tierIndex,
    quantity,
    paymentToken,
    value,
    chainId
  } = input

  try {
    const validatedInput = PurchaseTicketsSchema.parse(input)

    const { request } = await simulateContract(wagmiConfig as unknown as Config, {
      abi: TicketABI,
      address: ticketProxy as `0x${string}`,
      functionName: 'purchaseTickets',
      args: [showId, tierIndex, quantity, paymentToken],
      value: paymentToken === NULL_ADDRESS ? BigInt(value ?? 0) : undefined,
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

export const usePurchaseTickets = () => {
  return useMutation({
    mutationFn: (input: PurchaseTicketsType) => purchaseTickets(input),
    onError: error => {
      console.error('Error purchasing tickets:', error)
    }
  })
}
