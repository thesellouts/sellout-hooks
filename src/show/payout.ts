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

const PayoutSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type PayoutType = z.infer<typeof PayoutSchema>

export const payout = async (input: PayoutType) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = PayoutSchema.parse(input)

    const { request } = await simulateContract(wagmiConfig, {
      abi: ShowABI,
      address: addresses.Show as `0x${string}`,
      functionName: 'payout',
      args: [validatedInput.showId],
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

export const usePayout = () => {
  return useMutation({
    mutationFn: (input: PayoutType) => payout(input),
    onError: error => {
      console.error('Error executing payout:', error)
    }
  })
}
