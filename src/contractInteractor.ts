import { Config, getPublicClient, writeContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { useMemo } from 'react'
import { Abi, Address, Chain, Hash } from 'viem'
import { useChainId, useConfig } from 'wagmi'

interface TransactionReceipt {
  transactionHash: Hash
  blockNumber: bigint
  status: 'success' | 'reverted'
}

interface ContractInteractionParams {
  address: Address
  abi: Abi
  functionName: string
  args?: unknown[]
  value?: bigint
}

class ContractInteractor {
  private config: Config
  private smartAccountClient?: SmartAccountClient
  private chain: Chain

  constructor(
    config: Config,
    chain: Chain,
    smartAccountClient?: SmartAccountClient
  ) {
    this.config = config
    this.chain = chain
    this.smartAccountClient = smartAccountClient
  }

  async execute(
    params: ContractInteractionParams
  ): Promise<TransactionReceipt> {
    if (this.smartAccountClient) {
      return this.executeWithSmartAccount(params)
    } else {
      return this.executeWithEOA(params)
    }
  }

  private async executeWithSmartAccount(
    params: ContractInteractionParams
  ): Promise<TransactionReceipt> {
    try {
      const hash = await (this.smartAccountClient as any).writeContract({
        ...params,
        chain: this.chain
      })

      const publicClient = getPublicClient(this.config)
      if (!publicClient) throw new Error('Failed to get public client')

      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 'success' ? 'success' : 'reverted'
      }
    } catch (error) {
      console.error('Error executing with smart account:', error)
      throw error
    }
  }

  private async executeWithEOA(
    params: ContractInteractionParams
  ): Promise<TransactionReceipt> {
    try {
      const hash = await writeContract(this.config, {
        ...params,
        chain: this.chain
      })

      const publicClient = await getPublicClient(this.config)
      if (!publicClient) throw new Error('Failed to get public client')

      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 'success' ? 'success' : 'reverted'
      }
    } catch (error) {
      console.error('Error executing with EOA:', error)
      throw error
    }
  }
}

export function createContractInteractor(
  config: Config,
  chain: Chain,
  smartAccountClient?: SmartAccountClient
): ContractInteractor {
  return new ContractInteractor(config, chain, smartAccountClient)
}

export function useContractInteractor(smartAccountClient?: SmartAccountClient) {
  const config = useConfig()
  const chainId = useChainId()
  const chain = config.chains.find(c => c.id === chainId)!

  return useMemo(
    () => createContractInteractor(config, chain, smartAccountClient),
    [config, chain, smartAccountClient]
  )
}
