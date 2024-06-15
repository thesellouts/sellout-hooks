import { Config } from '@wagmi/core'
import { sepolia, zora } from 'viem/chains'
import { createConfig, http } from 'wagmi'

export const wagmiConfig: Config = createConfig({
  chains: [sepolia, zora],
  transports: {
    [sepolia.id]: http(),
    [zora.id]: http()
  }
}) as Config
