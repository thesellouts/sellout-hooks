import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import { ContractInteractor } from '../contractInteractor'

const HasTicketSchema = z.object({
  wallet: z.string(),
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type HasTicketInput = z.infer<typeof HasTicketSchema>

export const hasTicket = async (
  input: HasTicketInput,
  contractInteractor: ContractInteractor
): Promise<boolean> => {
  const { wallet, showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'hasTicket',
      args: [wallet, showId]
    })
  } catch (error) {
    console.error('Error checking ticket ownership:', error)
    throw new Error('Failed to check ticket ownership')
  }
}

export const useHasTicket = (
  input: HasTicketInput,
  contractInteractor: ContractInteractor
) => {
  return useQuery({
    queryKey: ['hasTicket', input.wallet, input.showId],
    queryFn: () => hasTicket(input, contractInteractor),
    enabled: !!input.wallet && !!input.showId
  })
}
