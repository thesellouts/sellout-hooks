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
import { getContractAddresses } from '../config'

const WithdrawRefundSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type WithdrawRefundType = z.infer<typeof WithdrawRefundSchema>

export const withdrawRefund = async (
  input: WithdrawRefundType,
  config: Config
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = WithdrawRefundSchema.parse(input)

    const { request } = await simulateContract(config, {
      abi: ShowABI,
      address: addresses.Show as `0x${string}`,
      functionName: 'withdrawRefund',
      args: [validatedInput.showId],
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

export const useWithdrawRefund = (
  input: WithdrawRefundType,
  config: Config
) => {
  return useMutation({
    mutationFn: () => withdrawRefund(input, config),
    onError: error => {
      console.error('Error withdrawing refund:', error)
    }
  })
}
