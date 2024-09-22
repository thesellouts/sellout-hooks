import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ConfigService,
  ContractInteractor,
  createContractInteractor,
  useContractInteractor
} from '../../contractInteractor'
import { AddressSchema } from '../../utils'

const SetCreditControlPermissionSchema = z.object({
  contractAddress: AddressSchema,
  permission: z.boolean(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SetCreditControlPermissionInput = z.infer<
  typeof SetCreditControlPermissionSchema
>

export interface SetCreditControlPermissionResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}

const setCreditControlPermissionCore = async (
  input: SetCreditControlPermissionInput,
  contractInteractor: ContractInteractor,
  config: Config
): Promise<SetCreditControlPermissionResult> => {
  const { chainId, contractAddress, permission } = input
  const addresses = getContractAddresses(chainId)

  try {
    const validatedInput = SetCreditControlPermissionSchema.parse(input)

    // Simulate the contract call
    const { request } = await simulateContract(config, {
      abi: ReferralABI,
      address: addresses.ReferralModule as `0x${string}`,
      functionName: 'setCreditControlPermission',
      args: [validatedInput.contractAddress, validatedInput.permission],
      chainId
    })

    // Execute the contract interaction
    const receipt = await contractInteractor.execute({
      address: request.address,
      abi: ReferralABI as Abi,
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

export const setCreditControlPermission = async (
  input: SetCreditControlPermissionInput
): Promise<SetCreditControlPermissionResult> => {
  const config = ConfigService.getConfig()
  const chain = config.chains.find(c => c.id === input.chainId)!
  if (!chain) {
    throw new Error(`Chain with id ${input.chainId} not found in config`)
  }
  const contractInteractor = createContractInteractor(config, chain)
  return setCreditControlPermissionCore(input, contractInteractor, config)
}

export const useSetCreditControlPermission = (
  input: SetCreditControlPermissionInput
): UseMutationResult<SetCreditControlPermissionResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = input.chainId ?? contextChainId
  const contractInteractor = useContractInteractor(effectiveChainId)

  return useMutation({
    mutationFn: () => {
      if (effectiveChainId !== base.id && effectiveChainId !== baseSepolia.id) {
        throw new Error(`Unsupported chain ID: ${effectiveChainId}`)
      }
      return setCreditControlPermissionCore(
        { ...input, chainId: effectiveChainId },
        contractInteractor,
        config
      )
    },
    onError: error => {
      console.error('Error setting credit control permission:', error)
    }
  })
}
