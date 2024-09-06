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

const RefundBribeSchema = z.object({
  showId: z.string(),
  venueId: z.number(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type RefundBribeType = z.infer<typeof RefundBribeSchema>

export const refundBribe = async (input: RefundBribeType, config: Config) => {
  const { showId, venueId, proposalIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = RefundBribeSchema.parse(input)

    const { request } = await simulateContract(config, {
      abi: ShowABI,
      address: addresses.Show as `0x${string}`,
      functionName: 'refundBribe',
      args: [
        validatedInput.showId,
        validatedInput.venueId,
        validatedInput.proposalIndex
      ],
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

export const useRefundBribe = (input: RefundBribeType, config: Config) => {
  return useMutation({
    mutationFn: () => refundBribe(input, config),
    onError: error => {
      console.error('Error refunding bribe:', error)
    }
  })
}
