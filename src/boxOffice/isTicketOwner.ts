import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { BoxOfficeABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const IsTicketOwnerSchema = z.object({
  showId: z.string(),
  wallet: z.string(),
  tokenId: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type IsTicketOwnerInput = z.infer<typeof IsTicketOwnerSchema>

export const isTicketOwner = async (
  input: IsTicketOwnerInput,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { chainId, showId, wallet, tokenId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      abi: BoxOfficeABI as Abi,
      address: addresses.BoxOffice as `0x${string}`,
      functionName: 'isTokenOwner',
      args: [showId, wallet, tokenId]
    })
  } catch (err) {
    console.error('Error checking token owner:', err)
    throw err
  }
}

export const useIsTicketOwner = (
  input: IsTicketOwnerInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['isTicketOwner', input],
    queryFn: () => isTicketOwner(input, contractInteractor),
    enabled: !!input.showId && !!input.wallet && input.tokenId !== undefined
  })
}
