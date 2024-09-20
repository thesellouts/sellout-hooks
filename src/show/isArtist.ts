import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const IsArtistSchema = z.object({
  user: z.string(),
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsArtistInput = z.infer<typeof IsArtistSchema>

export const isArtist = async (
  input: IsArtistInput,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { user, showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'isArtist',
      args: [user, showId]
    })
  } catch (error) {
    console.error('Error checking if user is an artist:', error)
    throw new Error('Failed to check if user is an artist')
  }
}

export const useIsArtist = (
  input: IsArtistInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['isArtist', input.user, input.showId],
    queryFn: () => isArtist(input, contractInteractor),
    enabled: !!input.user && !!input.showId
  })
}
