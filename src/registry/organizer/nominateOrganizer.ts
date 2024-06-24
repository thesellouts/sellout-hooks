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

const NominateOrganizerSchema = z.object({
  nominee: z.string(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type NominateOrganizerInput = z.infer<typeof NominateOrganizerSchema>

export const nominateOrganizer = async (input: NominateOrganizerInput) => {
  const { chainId, nominee } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = NominateOrganizerSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig as unknown as Config, {
    abi: OrganizerRegistryABI,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'nominate',
    args: [validatedInput.nominee],
    chainId
  })

  const hash = await writeContract(wagmiConfig as unknown as Config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(wagmiConfig as unknown as Config, { hash })
  }
}

export const useNominateOrganizer = () => {
  return useMutation({
    mutationFn: (input: NominateOrganizerInput) => nominateOrganizer(input),
    onError: error => {
      console.error('Error nominating organizer:', error)
    }
  })
}
