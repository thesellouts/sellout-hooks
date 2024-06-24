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

const SetTokenURISchema = z.object({
  showId: z.string(),
  tokenId: z.number(),
  newURI: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type SetTokenURIType = z.infer<typeof SetTokenURISchema>

export const setTokenURI = async (input: SetTokenURIType) => {
  const { showId, tokenId, newURI, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = SetTokenURISchema.parse(input)

    const { request } = await simulateContract(wagmiConfig as unknown as Config, {
      abi: TicketABI,
      address: addresses.Ticket as `0x${string}`,
      functionName: 'setTokenURI',
      args: [
        validatedInput.showId,
        validatedInput.tokenId,
        validatedInput.newURI
      ],
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

export const useSetTokenURI = () => {
  return useMutation({
    mutationFn: (input: SetTokenURIType) => setTokenURI(input),
    onError: error => {
      console.error('Error setting token URI:', error)
    }
  })
}
