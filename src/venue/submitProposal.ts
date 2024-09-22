import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi } from 'viem'
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

const SubmitProposalSchema = z.object({
  showId: z.string(),
  venueId: z.number(),
  proposedDates: z.array(z.number()),
  paymentToken: z.string(),
  paymentAmount: z.string().optional(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SubmitProposal = z.infer<typeof SubmitProposalSchema>

export interface SubmitProposalResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const submitProposalCore = async (
  input: SubmitProposal,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<SubmitProposalResult> => {
  const {
    showId,
    venueId,
    proposedDates,
    paymentToken,
    paymentAmount,
    chainId
  } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = SubmitProposalSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: VenueABI,
      address: addresses.Venue as `0x${string}`,
      functionName: 'submitProposal',
      args: [showId, venueId, proposedDates, paymentToken],
      chainId
    })

    // Execute the contract interaction
    const receipt = await contractInteractor.execute({
      address: request.address,
      abi: VenueABI as Abi,
      functionName: request.functionName,
      args: request.args ? [...request.args] : undefined,
      value: paymentAmount ? BigInt(paymentAmount) : BigInt(0)
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

export const submitProposal = async (
  input: SubmitProposal
): Promise<SubmitProposalResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return submitProposalCore(input, contractInteractor, config)
}

export const useSubmitProposal = (
  input: SubmitProposal
): UseMutationResult<SubmitProposalResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () =>
      submitProposalCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      ),
    onError: error => {
      console.error('Error executing submitProposal:', error)
    }
  })
}
