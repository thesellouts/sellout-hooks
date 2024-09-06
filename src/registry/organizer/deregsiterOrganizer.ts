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

const DeregisterOrganizerSchema = z.object({
  organizerId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type DeregisterOrganizerInput = z.infer<typeof DeregisterOrganizerSchema>

export const deregisterOrganizer = async (
  input: DeregisterOrganizerInput,
  config: Config
) => {
  const { chainId, organizerId } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = DeregisterOrganizerSchema.parse(input)

  const { request } = await simulateContract(config, {
    abi: OrganizerRegistryABI,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'deregisterOrganizer',
    args: [validatedInput.organizerId],
    chainId
  })

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useDeregisterOrganizer = (
  input: DeregisterOrganizerInput,
  config: Config
) => {
  return useMutation({
    mutationFn: () => deregisterOrganizer(input, config),
    onError: error => {
      console.error('Error deregistering organizer:', error)
    }
  })
}
