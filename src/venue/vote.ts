import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { VenueABI } from '../abis'
import { getContractAddresses } from '../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const VoteSchema = z.object({
  showId: z.string(),
  proposalIndex: z.number(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type Vote = z.infer<typeof VoteSchema>

export interface VoteResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

const voteCore = async (
  input: Vote,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<VoteResult> => {
  const { showId, proposalIndex, chainId } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = VoteSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: VenueABI,
      address: addresses.Venue as `0x${string}`,
      functionName: 'vote',
      args: [showId, proposalIndex],
      chainId
    })

    // Execute the contract interaction
    const receipt = await contractInteractor.execute({
      address: request.address,
      abi: VenueABI as Abi,
      functionName: request.functionName,
      args: request.args ? [...request.args] : undefined
    })

    return {
      hash: receipt.transactionHash,
      receipt
    }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const vote = async (input: Vote): Promise<VoteResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return voteCore(input, contractInteractor, config)
}

export const useVote = (input: Vote): UseMutationResult<VoteResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () =>
      voteCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error executing vote:', error)
    }
  })
}
