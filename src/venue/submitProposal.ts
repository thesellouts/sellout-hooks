import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { VenueABI } from '../abis'
import {
  ContractInteractor,
  useContractInteractor
} from '../contractInteractor'

const SubmitProposalSchema = z.object({
  showId: z.string(),
  venueProxyAddress: z.string(),
  venueId: z.number(),
  proposedDates: z.array(z.number()),
  paymentToken: z.string(),
  paymentAmount: z.string().optional(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SubmitProposal = z.infer<typeof SubmitProposalSchema>

export interface SubmitProposalResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const submitProposalCore = async (
  input: SubmitProposal,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
): Promise<SubmitProposalResult> => {
  try {
    const validatedInput = SubmitProposalSchema.parse(input)
    const account =
      options?.smart !== false
        ? contractInteractor.smartAccountAddress
        : undefined

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: VenueABI,
      address: validatedInput.venueProxyAddress as `0x${string}`,
      functionName: 'submitProposal',
      args: [
        validatedInput.showId,
        validatedInput.venueId,
        validatedInput.proposedDates,
        validatedInput.paymentToken
      ],
      chainId: validatedInput.chainId,
      account
    })

    // Execute the contract interaction
    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: VenueABI as Abi,
        functionName: request.functionName,
        args: request.args ? [...request.args] : undefined,
        value: validatedInput.paymentAmount
          ? BigInt(validatedInput.paymentAmount)
          : BigInt(0)
      },
      options
    )

    return {
      hash: receipt.transactionHash,
      receipt
    }
  } catch (err) {
    console.error('Validation or Execution Error:', err)
    throw err
  }
}

export const useSubmitProposal = (
  input: SubmitProposal,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<SubmitProposalResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (input.chainId ?? contextChainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

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
