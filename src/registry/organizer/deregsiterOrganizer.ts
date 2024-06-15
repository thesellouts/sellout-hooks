import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses, wagmiConfig } from '../../config'

const DeregisterOrganizerSchema = z.object({
  organizerId: z.number(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type DeregisterOrganizerInput = z.infer<typeof DeregisterOrganizerSchema>

export const deregisterOrganizer = async (input: DeregisterOrganizerInput) => {
  const { chainId, organizerId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = DeregisterOrganizerSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig, {
    abi: OrganizerRegistryABI,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'deregisterOrganizer',
    args: [validatedInput.organizerId],
    chainId
  })

  const hash = await writeContract(wagmiConfig, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(wagmiConfig, { hash })
  }
}

export const useDeregisterOrganizer = () => {
  return useMutation({
    mutationFn: (input: DeregisterOrganizerInput) => deregisterOrganizer(input),
    onError: error => {
      console.error('Error deregistering organizer:', error)
    }
  })
}
