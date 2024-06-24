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

const CancelShowSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type CancelShowType = z.infer<typeof CancelShowSchema>

export const cancelShow = async (input: CancelShowType, config: Config) => {
  const { chainId, showId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = CancelShowSchema.parse(input)

    const { request } = await simulateContract(config, {
      abi: ShowABI,
      address: addresses.Show as `0x${string}`,
      functionName: 'cancelShow',
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

export const useCancelShow = (input: CancelShowType, config: Config) => {
  return useMutation({
    mutationFn: () => cancelShow(input, config),
    onError: error => {
      console.error('Error canceling show:', error)
    }
  })
}
