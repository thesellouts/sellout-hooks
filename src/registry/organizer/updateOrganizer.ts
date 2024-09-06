import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { OrganizerRegistryABI } from '../../abis'
import { getContractAddresses } from '../../config'

const UpdateOrganizerSchema = z.object({
  organizerId: z.number(),
  name: z.string(),
  bio: z.string(),
  wallet: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type UpdateOrganizerInput = z.infer<typeof UpdateOrganizerSchema>

export const updateOrganizer = async (
  input: UpdateOrganizerInput,
  config: Config
) => {
  const { chainId, organizerId, name, bio, wallet } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = UpdateOrganizerSchema.parse(input)

  const { request } = await simulateContract(config, {
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

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useUpdateOrganizer = (
  input: UpdateOrganizerInput,
  config: Config
) => {
  return useMutation({
    mutationFn: () => updateOrganizer(input, config),
    onError: error => {
      console.error('Error updating organizer:', error)
    }
  })
}
