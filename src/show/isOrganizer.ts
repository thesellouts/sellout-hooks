import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const IsOrganizerSchema = z.object({
  user: z.string(),
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsOrganizerInput = z.infer<typeof IsOrganizerSchema>

export const isOrganizer = async (
  input: IsOrganizerInput,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { user, showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'isOrganizer',
      args: [user, showId]
    })
  } catch (error) {
    console.error('Error checking if user is an organizer:', error)
    throw new Error('Failed to check if user is an organizer')
  }
}

export const useIsOrganizer = (
  input: IsOrganizerInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['isOrganizer', input.user, input.showId],
    queryFn: () => isOrganizer(input, contractInteractor),
    enabled: !!input.user && !!input.showId
  })
}
