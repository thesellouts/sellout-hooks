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

const WithdrawRefundSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type WithdrawRefundType = z.infer<typeof WithdrawRefundSchema>

export const withdrawRefund = async (input: WithdrawRefundType) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = WithdrawRefundSchema.parse(input)

    const { request } = await simulateContract(wagmiConfig as unknown as Config, {
      abi: ShowABI,
      address: addresses.Show as `0x${string}`,
      functionName: 'withdrawRefund',
      args: [validatedInput.showId],
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

export const useWithdrawRefund = () => {
  return useMutation({
    mutationFn: (input: WithdrawRefundType) => withdrawRefund(input),
    onError: error => {
      console.error('Error withdrawing refund:', error)
    }
  })
}
