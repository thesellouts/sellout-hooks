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
import { AddressSchema, NULL_ADDRESS } from '../utils'

// Schema for VenueProposalParams matching the Solidity structure
const VenueProposalParamsSchema = z.object({
  proposalPeriodDuration: z.number(),
  proposalDateExtension: z.number(),
  proposalDateMinimumFuture: z.number(),
  proposalPeriodExtensionThreshold: z.number()
})

const ProposeShowSchema = z.object({
  name: z.string(),
  description: z.string(),
  artists: z.array(AddressSchema),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  radius: z
    .union([z.string(), z.number()])
    .transform(value => parseFloat(value.toString()))
    .refine(value => !isNaN(value) && value >= 0, {
      message: 'Radius must be a valid non-negative number'
    }),
  sellOutThreshold: z
    .union([z.number(), z.string()])
    .transform(value => parseInt(value.toString(), 10))
    .refine(value => !isNaN(value), {
      message: 'sellOutThreshold must be a valid integer'
    }),
  totalCapacity: z
    .union([z.number(), z.string()])
    .transform(value => parseInt(value.toString(), 10))
    .refine(value => !isNaN(value), {
      message: 'totalCapacity must be a valid integer'
    }),
  ticketTiers: z.array(
    z.object({
      name: z.string(),
      price: z.string(),
      ticketsAvailable: z.string()
    })
  ),
  split: z.array(z.bigint()),
  currencyAddress: AddressSchema.default(NULL_ADDRESS),
  venueProposalParams: VenueProposalParamsSchema,
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type ProposeShowType = z.infer<typeof ProposeShowSchema>

export const proposeShow = async (input: ProposeShowType) => {
  const { chainId, ...args } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = ProposeShowSchema.parse(input)

    const { request } = await simulateContract(wagmiConfig, {
      abi: ShowABI,
      address: addresses.Show as `0x${string}`,
      functionName: 'proposeShow',
      args: [validatedInput],
      chainId
    })

    const hash = await writeContract(wagmiConfig, request)
    return {
      hash,
      getReceipt: () => waitForTransactionReceipt(wagmiConfig, { hash })
    }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const useProposeShow = () => {
  return useMutation({
    mutationFn: (input: ProposeShowType) => proposeShow(input),
    onError: error => {
      console.error('Error proposing show:', error)
    }
  })
}
