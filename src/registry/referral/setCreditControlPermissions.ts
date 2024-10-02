import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, TransactionReceipt } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import {
  ContractInteractor,
  useContractInteractor
} from '../../contractInteractor'
import { AddressSchema } from '../../utils'

const SetCreditControlPermissionSchema = z.object({
  contractAddress: AddressSchema,
  permission: z.boolean(),
  chainId: z.union([z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SetCreditControlPermission = z.infer<
  typeof SetCreditControlPermissionSchema
>

export interface SetCreditControlPermissionResult {
  hash: `0x${string}`
  receipt: TransactionReceipt
}

export const setCreditControlPermissionCore = async (
  input: SetCreditControlPermission,
  contractInteractor: ContractInteractor,
  config: Config,
  options?: { smart?: boolean }
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
    const receipt = await contractInteractor.execute(
      {
        address: request.address,
        abi: ReferralABI as Abi,
        functionName: request.functionName,
        args: request.args ? [...request.args] : undefined
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

export const useSetCreditControlPermission = (
  input: SetCreditControlPermission,
  options?: { smartAccountClient?: SmartAccountClient }
): UseMutationResult<SetCreditControlPermissionResult, Error> => {
  const config = useConfig()
  const contextChainId = useChainId()
  const effectiveChainId = (contextChainId ?? input.chainId) as 8453 | 84532
  const contractInteractor = useContractInteractor(
    effectiveChainId,
    options?.smartAccountClient
  )

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
