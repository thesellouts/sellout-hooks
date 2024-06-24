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

const CompleteShowSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type CompleteShowType = z.infer<typeof CompleteShowSchema>

export const completeShow = async (input: CompleteShowType) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)
  try {
    const validatedInput = CompleteShowSchema.parse(input)

    const { request } = await simulateContract(wagmiConfig as unknown as Config, {
      abi: ShowABI,
      address: addresses.Show as `0x${string}`,
      functionName: 'completeShow',
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

export const useCompleteShow = () => {
  return useMutation({
    mutationFn: (input: CompleteShowType) => completeShow(input),
    onError: error => {
      console.error('Error completing show:', error)
    }
  })
}
