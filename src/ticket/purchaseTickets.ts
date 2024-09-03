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
import { AddressSchema, NULL_ADDRESS } from '../utils'

const PurchaseTicketsSchema = z.object({
  ticketProxy: AddressSchema,
  showId: z.string(),
  tierIndex: z.number(),
  quantity: z.number(),
  paymentToken: AddressSchema,
  value: z.bigint().optional(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type PurchaseTicketsType = z.infer<typeof PurchaseTicketsSchema>

export const purchaseTickets = async (
  input: PurchaseTicketsType,
  config: Config
) => {
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

    const { request } = await simulateContract(config, {
      abi: TicketABI,
      address: ticketProxy as `0x${string}`,
      functionName: 'purchaseTickets',
      args: [showId, tierIndex, quantity, paymentToken],
      value: paymentToken === NULL_ADDRESS ? BigInt(value ?? 0) : undefined,
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

export const usePurchaseTickets = (
  input: PurchaseTicketsType,
  config: Config
) => {
  return useMutation({
    mutationFn: () => purchaseTickets(input, config),
    onError: error => {
      console.error('Error purchasing tickets:', error)
    }
  })
}
