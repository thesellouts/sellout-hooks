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

const CancelShowSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type CancelShowType = z.infer<typeof CancelShowSchema>

export const cancelShow = async (input: CancelShowType) => {
  const { chainId, showId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = CancelShowSchema.parse(input)

    const { request } = await simulateContract(wagmiConfig as unknown as Config, {
      abi: ShowABI,
      address: addresses.Show as `0x${string}`,
      functionName: 'cancelShow',
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

export const useCancelShow = () => {
  return useMutation({
    mutationFn: (input: CancelShowType) => cancelShow(input),
    onError: error => {
      console.error('Error canceling show:', error)
    }
  })
}
