import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { Config, simulateContract } from '@wagmi/core'
import { useMemo } from 'react'
import { Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { ContractInteractor } from '../../contractInteractor'
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

const createSetCreditControlPermission =
  (contractInteractor: ContractInteractor, config: Config) =>
  async (
    input: SetCreditControlPermissionInput
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

export const useSetCreditControlPermission = (
  input: SetCreditControlPermissionInput,
  contractInteractor: ContractInteractor,
  config: Config
): UseMutationResult<SetCreditControlPermissionResult, Error> => {
  const setCreditControlPermission = useMemo(
    () => createSetCreditControlPermission(contractInteractor, config),
    [contractInteractor, config]
  )

  return useMutation({
    mutationFn: () => setCreditControlPermission(input),
    onError: error => {
      console.error('Error setting credit control permission:', error)
    }
  })
}
