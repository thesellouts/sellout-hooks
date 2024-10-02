import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'
import { AddressSchema, NULL_ADDRESS } from '../utils'

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
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type ProposeShow = z.infer<typeof ProposeShowSchema>

export interface ProposeShowResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const proposeShowCore = async (
  input: ProposeShow,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<ProposeShowResult> => {
  const { chainId, ...args } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = ProposeShowSchema.parse(input)

    const { request } = await simulateContract(config, {
      abi: ShowABI as Abi,
      address: addresses.Show as `0x${string}`,
      functionName: 'proposeShow',
      args: [validatedInput],
      chainId
    })

    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: ShowABI as Abi,
        functionName: request.functionName,
        args: Array.isArray(request.args) ? [...request.args] : undefined,
        value: request.value
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

export const useProposeShow = (
  input: ProposeShow,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<ProposeShowResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (contextChainId ?? input.chainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

  return useMutation({
    mutationFn: () => {
      if (effectiveChainId !== base.id && effectiveChainId !== baseSepolia.id) {
        throw new Error(`Unsupported chain ID: ${effectiveChainId}`)
      }
      return proposeShowCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      )
    },
    onError: error => {
      console.error('Error proposing show:', error)
    }
  })
}
