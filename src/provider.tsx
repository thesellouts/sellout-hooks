import { SmartAccountClient } from 'permissionless'
import React, { createContext, useContext, useMemo } from 'react'
import { base, baseSepolia } from 'viem/chains'
import { useConfig } from 'wagmi'

import { SelloutSDK } from './sdk'

interface SelloutSDKContextType {
  sdk: SelloutSDK
}

const SelloutSDKContext = createContext<SelloutSDKContextType | undefined>(
  undefined
)

interface SelloutSDKProviderProps {
  children: React.ReactNode
  chainId: typeof base.id | typeof baseSepolia.id
  smartAccountClient?: SmartAccountClient
}

export const SelloutProvider: React.FC<SelloutSDKProviderProps> = ({
  children,
  chainId,
  smartAccountClient
}) => {
  const config = useConfig()

  const sdk = useMemo(() => {
    return new SelloutSDK(config, chainId, smartAccountClient)
  }, [config, chainId, smartAccountClient])

  return (
    <SelloutSDKContext.Provider value={{ sdk }}>
      {children}
    </SelloutSDKContext.Provider>
  )
}

export const useSellout = (): SelloutSDK => {
  const context = useContext(SelloutSDKContext)
  if (!context) {
    throw new Error('useSellout must be used within a SelloutProvider')
  }
  return context.sdk
}
