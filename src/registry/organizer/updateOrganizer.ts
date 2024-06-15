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

const UpdateOrganizerSchema = z.object({
  organizerId: z.number(),
  name: z.string(),
  bio: z.string(),
  wallet: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type UpdateOrganizerInput = z.infer<typeof UpdateOrganizerSchema>

export const updateOrganizer = async (input: UpdateOrganizerInput) => {
  const { chainId, organizerId, name, bio, wallet } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = UpdateOrganizerSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig, {
    abi: OrganizerRegistryABI,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'updateOrganizer',
    args: [
      validatedInput.organizerId,
      validatedInput.name,
      validatedInput.bio,
      validatedInput.wallet
    ],
    chainId
  })

  const hash = await writeContract(wagmiConfig, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(wagmiConfig, { hash })
  }
}

export const useUpdateOrganizer = () => {
  return useMutation({
    mutationFn: (input: UpdateOrganizerInput) => updateOrganizer(input),
    onError: error => {
      console.error('Error updating organizer:', error)
    }
  })
}
