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

const AcceptNominationSchema = z.object({
  name: z.string(),
  bio: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type AcceptOrganizerNominationInput = z.infer<
  typeof AcceptNominationSchema
>

export const acceptOrganizerNomination = async (
  input: AcceptOrganizerNominationInput,
  config: Config
) => {
  const { chainId, name, bio } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = AcceptNominationSchema.parse(input)

  const { request } = await simulateContract(config, {
    abi: OrganizerRegistryABI,
    address: addresses.OrganizerRegistry as `0x${string}`,
    functionName: 'acceptNomination',
    args: [validatedInput.name, validatedInput.bio],
    chainId
  })

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useAcceptOrganizerNomination = (
  input: AcceptOrganizerNominationInput,
  config: Config
) => {
  return useMutation({
    mutationFn: () => acceptOrganizerNomination(input, config),
    onError: error => {
      console.error('Error accepting nomination:', error)
    }
  })
}
