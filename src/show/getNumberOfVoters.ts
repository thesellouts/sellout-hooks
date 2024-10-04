import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId } from 'wagmi'
import { z } from 'zod'

import { ShowABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const GetNumberOfVotersSchema = z.object({
  showId: z.string(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type GetNumberOfVoters = z.infer<typeof GetNumberOfVotersSchema>

export const getNumberOfVotersCore = async (
  input: GetNumberOfVoters,
  contractInteractor: ContractInteractor
): Promise<bigint> => {
  const { showId, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    return await contractInteractor.read<bigint>({
      address: addresses.Show as `0x${string}`,
      abi: ShowABI as Abi,
      functionName: 'getNumberOfVoters',
      args: [showId]
    })
  } catch (error) {
    console.error('Error reading number of voters:', error)
    throw new Error('Failed to fetch number of voters')
  }
}

type UseGetNumberOfVotersOptions = Omit<
  UseQueryOptions<bigint, Error, bigint, [string, string]>,
  'queryKey' | 'queryFn'
> & {
  enabled?: boolean
}

export const useGetNumberOfVoters = (
  input: GetNumberOfVoters,
  options?: UseGetNumberOfVotersOptions
): UseQueryResult<bigint, Error> => {
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(effectiveChainId)

  const { enabled, ...queryOptions } = options || {}

  return useQuery({
    queryKey: ['getNumberOfVoters', input.showId],
    queryFn: () =>
      getNumberOfVotersCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor
      ),
    enabled: enabled !== undefined ? enabled && !!input.showId : !!input.showId,
    ...queryOptions
  })
}
