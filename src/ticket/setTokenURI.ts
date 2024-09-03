import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { TicketABI } from '../abis'
import { getContractAddresses } from '../config'

const SetTokenURISchema = z.object({
  showId: z.string(),
  tokenId: z.number(),
  newURI: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SetTokenURIType = z.infer<typeof SetTokenURISchema>

export const setTokenURI = async (input: SetTokenURIType, config: Config) => {
  const { showId, tokenId, newURI, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = SetTokenURISchema.parse(input)

    const { request } = await simulateContract(config, {
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

export const useSetTokenURI = (input: SetTokenURIType, config: Config) => {
  return useMutation({
    mutationFn: () => setTokenURI(input, config),
    onError: error => {
      console.error('Error setting token URI:', error)
    }
  })
}
