import zoraAddresses from '@thesellouts/sellout-protocol/addresses/7777777.json'
import sepoliaAddresses from '@thesellouts/sellout-protocol/addresses/11155111.json'
import { Chain, sepolia, zora } from 'viem/chains'

interface ContractAddresses {
  [key: string]: `0x${string}`
}

const contracts: { [key in Chain['id']]?: ContractAddresses } = {
  [sepolia.id]: sepoliaAddresses as ContractAddresses,
  [zora.id]: zoraAddresses as ContractAddresses
}

export function getContractAddresses(chainId: Chain['id']): ContractAddresses {
  const addresses = contracts[chainId]

  if (!addresses) {
    throw new Error(`Unsupported chainId: ${chainId}`)
  }

  return addresses
}
