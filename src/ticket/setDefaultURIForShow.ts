import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const SetDefaultURIForShowSchema = z.object({
  showId: z.string(),
  newDefaultURI: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type SetDefaultURIForShowType = z.infer<
  typeof SetDefaultURIForShowSchema
>

export const setDefaultURIForShow = async (input: SetDefaultURIForShowType) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = SetDefaultURIForShowSchema.parse(input)

    const { request } = await simulateContract(wagmiConfig as unknown as Config, {
      abi: TicketABI,
      address: addresses.Ticket as `0x${string}`,
      functionName: 'setDefaultURIForShow',
      args: [validatedInput.showId, validatedInput.newDefaultURI],
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

export const useSetDefaultURIForShow = () => {
  return useMutation({
    mutationFn: (input: SetDefaultURIForShowType) =>
      setDefaultURIForShow(input),
    onError: error => {
      console.error('Error setting default URI for show:', error)
    }
  })
}
