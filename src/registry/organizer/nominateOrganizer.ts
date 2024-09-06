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

const NominateOrganizerSchema = z.object({
  nominee: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type NominateOrganizerInput = z.infer<typeof NominateOrganizerSchema>

export const nominateOrganizer = async (
  input: NominateOrganizerInput,
  config: Config
) => {
  const { chainId, nominee } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = NominateOrganizerSchema.parse(input)

  const { request } = await simulateContract(config, {
    abi: OrganizerRegistryABI,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'nominate',
    args: [validatedInput.nominee],
    chainId
  })

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useNominateOrganizer = (
  input: NominateOrganizerInput,
  config: Config
) => {
  return useMutation({
    mutationFn: () => nominateOrganizer(input, config),
    onError: error => {
      console.error('Error nominating organizer:', error)
    }
  })
}
