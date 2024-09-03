import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora, base, baseSepolia } from 'viem/chains'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses } from '../../config'
import { AddressSchema } from '../../utils'

const SetCreditControlPermissionSchema = z.object({
  contractAddress: AddressSchema,
  permission: z.boolean(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id), z.literal(base.id), z.literal(baseSepolia.id)])
})

export type SetCreditControlPermissionInput = z.infer<
  typeof SetCreditControlPermissionSchema
>

export const setCreditControlPermission = async (
  input: SetCreditControlPermissionInput,
  config: Config
) => {
  const { chainId, contractAddress, permission } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = SetCreditControlPermissionSchema.parse(input)

  const { request } = await simulateContract(config, {
    abi: ReferralABI,
    address: addresses.ReferralModule as `0x${string}`,
    functionName: 'setCreditControlPermission',
    args: [validatedInput.contractAddress, validatedInput.permission],
    chainId
  })

  const hash = await writeContract(config, request)
  return {
    hash,
    getReceipt: () => waitForTransactionReceipt(config, { hash })
  }
}

export const useSetCreditControlPermission = (
  input: SetCreditControlPermissionInput,
  config: Config
) => {
  return useMutation({
    mutationFn: () => setCreditControlPermission(input, config),
    onError: error => {
      console.error('Error setting credit control permission:', error)
    }
  })
}
