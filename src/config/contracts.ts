import baseAddresses from '@thesellouts/sellout-protocol/addresses/8453.json'
import baseSepoliaAddresses from '@thesellouts/sellout-protocol/addresses/84532.json'
import { base, baseSepolia, Chain } from 'viem/chains'

interface ContractAddresses {
  [key: string]: `0x${string}`
}

const contracts: { [key in Chain['id']]?: ContractAddresses } = {
  [baseSepolia.id]: baseSepoliaAddresses as ContractAddresses,
  [base.id]: baseAddresses as ContractAddresses
}

export function getContractAddresses(chainId: Chain['id']): ContractAddresses {
  const addresses = contracts[chainId]

  if (!addresses) {
    throw new Error(`Unsupported chainId: ${chainId}`)
  }

  return addresses
}
