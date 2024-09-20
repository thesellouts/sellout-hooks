import { useQuery } from '@tanstack/react-query'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'
import { Abi } from 'viem'

const GetShowOrganizerSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetShowOrganizerInput = z.infer<typeof GetShowOrganizerSchema>

export const getShowOrganizer = async (
  input: GetShowOrganizerInput,
  contractInteractor: ContractInteractor
) => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<string>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getOrganizer',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading organizer:', error)
    throw new Error('Failed to fetch organizer')
  }
}

export const useGetShowOrganizer = (
  input: GetShowOrganizerInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['getOrganizer', input.showId],
    queryFn: () => getShowOrganizer(input, contractInteractor),
    enabled: !!input.showId
  })
}
