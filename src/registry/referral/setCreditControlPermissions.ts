import { useMutation } from '@tanstack/react-query'
import {
  Config,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { z } from 'zod'

import { ReferralABI } from '../../abis'
import { getContractAddresses, wagmiConfig } from '../../config'
import { AddressSchema } from '../../utils'

const SetCreditControlPermissionSchema = z.object({
  contractAddress: AddressSchema,
  permission: z.boolean(),
  chainId: z.union([z.literal(sepolia.id), z.literal(zora.id)])
})

export type SetCreditControlPermissionInput = z.infer<
  typeof SetCreditControlPermissionSchema
>

export const setCreditControlPermission = async (
  input: SetCreditControlPermissionInput
) => {
  const { chainId, contractAddress, permission } = input
  const addresses = getContractAddresses(chainId)
  const validatedInput = SetCreditControlPermissionSchema.parse(input)

  const { request } = await simulateContract(wagmiConfig as unknown as Config, {
    abi: ReferralABI,
    address: addresses.ReferralModule as `0x${string}`,
    functionName: 'setCreditControlPermission',
    args: [validatedInput.contractAddress, validatedInput.permission],
    chainId
  })

  const hash = await writeContract(wagmiConfig as unknown as Config, request)
  return {
    hash,
    getReceipt: () =>
      waitForTransactionReceipt(wagmiConfig as unknown as Config, { hash })
  }
}

export const useSetCreditControlPermission = () => {
  return useMutation({
    mutationFn: (input: SetCreditControlPermissionInput) =>
      setCreditControlPermission(input),
    onError: error => {
      console.error('Error setting credit control permission:', error)
    }
  })
}
