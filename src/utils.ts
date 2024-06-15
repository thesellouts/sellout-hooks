import { isAddress } from 'viem'
import { z } from 'zod'

export const AddressSchema = z.string().refine(
  data => {
    return isAddress(data, { strict: false })
  },
  {
    message: 'Invalid Ethereum address format.'
  }
)

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
