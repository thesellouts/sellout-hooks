import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { getContractAddresses } from '../config'

const SetDefaultURIForShowSchema = z.object({
  showId: z.string(),
  newDefaultURI: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SetDefaultURIForShowType = z.infer<
  typeof SetDefaultURIForShowSchema
>

export const setDefaultURIForShow = async (
  input: SetDefaultURIForShowType,
  config: Config
) => {
  const { chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = SetDefaultURIForShowSchema.parse(input)

    const { request } = await simulateContract(config, {
      abi: TicketABI,
      address: addresses.Ticket as `0x${string}`,
      functionName: 'setDefaultURIForShow',
      args: [validatedInput.showId, validatedInput.newDefaultURI],
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

export const useSetDefaultURIForShow = (
  input: SetDefaultURIForShowType,
  config: Config
) => {
  return useMutation({
    mutationFn: () => setDefaultURIForShow(input, config),
    onError: error => {
      console.error('Error setting default URI for show:', error)
    }
  })
}
