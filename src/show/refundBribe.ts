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

const RefundBribeSchema = z.object({
  showId: z.string(),
  venueId: z.number(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type RefundBribeType = z.infer<typeof RefundBribeSchema>

export const refundBribe = async (input: RefundBribeType) => {
  const { showId, venueId, proposalIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = RefundBribeSchema.parse(input)

    const { request } = await simulateContract(wagmiConfig, {
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

export const useRefundBribe = () => {
  return useMutation({
    mutationFn: (input: RefundBribeType) => refundBribe(input),
    onError: error => {
      console.error('Error refunding bribe:', error)
    }
  })
}
