import {
  arbitrumNova,
  base,
  mainnet,
  optimism,
  sepolia,
  zora,
  zoraSepolia
} from 'viem/chains'
import { createConfig, http } from 'wagmi'

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, zora, zoraSepolia, optimism, base, arbitrumNova],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrumNova.id]: http(),
    [zora.id]: http(),
    [zoraSepolia.id]: http(),
    [optimism.id]: http(),
    [base.id]: http()
  }
})
