import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora, zoraSepolia } from 'viem/chains'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses, wagmiConfig } from '../config'

const VoteForDateSchema = z.object({
  showId: z.string(),
  dateIndex: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type VoteForDate = z.infer<typeof VoteForDateSchema>

export const voteForDate = async (input: VoteForDate) => {
  const { showId, dateIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = VoteForDateSchema.parse(input)

    const { request } = await simulateContract(wagmiConfig, {
      abi: VenueABI,
      address: addresses.Venue as `0x${string}`,
      functionName: 'voteForDate',
      args: [showId, dateIndex],
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

export const useVoteForDate = () => {
  return useMutation({
    mutationFn: (input: VoteForDate) => voteForDate(input),
    onError: error => {
      console.error('Error executing voteForDate:', error)
    }
  })
}
