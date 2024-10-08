import { Config, getPublicClient, writeContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import {
  Abi,
  Account,
  Address,
  Chain,
  Hash,
  PublicClient,
  TransactionReceipt
} from 'viem'
import { useConfig } from 'wagmi'

export interface ContractInteractionParams {
  address: Address
  abi: Abi
  functionName: string
  args?: readonly unknown[]
  value?: bigint
}

export class ConfigService {
  private static config: Config | null = null

  static initialize(config: Config) {
    this.config = config
  }

  static getConfig(): Config {
    if (!this.config)
      throw new Error(
        'Config not initialized. Call ConfigService.initialize first.'
      )
    return this.config
  }
}

export class ContractInteractor {
  private config: Config
  private smartAccountClient?: SmartAccountClient
  private chain: Chain
  private publicClient: PublicClient | undefined

  public get smartAccountAddress(): Address | undefined {
    return this.smartAccountClient?.account?.address
  }

  constructor(
    config: Config,
    chain: Chain,
    smartAccountClient?: SmartAccountClient
  ) {
    this.config = config
    this.chain = chain
    this.smartAccountClient = smartAccountClient
    this.publicClient = getPublicClient(config, { chainId: chain.id })

    if (!this.publicClient) {
      throw new Error('Failed to initialize public client')
    }
  }

  async execute(
    params: ContractInteractionParams,
    options?: { smart?: boolean }
  ): Promise<TransactionReceipt> {
    if (this.smartAccountClient && options?.smart !== false) {
      return this.executeWithSmartAccount(params)
    } else {
      return this.executeWithEOA(params)
    }
  }

  async read<T>(params: ContractInteractionParams): Promise<T> {
    if (!this.publicClient) {
      throw new Error('Public client is not available')
    }

    try {
      const result = await this.publicClient.readContract({
        ...params,
        args: params.args ? [...params.args] : undefined
      })
      return result as T
    } catch (error) {
      console.error('Error reading from contract:', error)
      throw error
    }
  }

  private async executeWithSmartAccount(
    params: ContractInteractionParams
  ): Promise<TransactionReceipt> {
    if (!this.publicClient || !this.smartAccountClient) {
      throw new Error('Public client or Smart Account client is not available')
    }

    try {
      const hash = await this.smartAccountClient.writeContract({
        ...params,
        account: this.smartAccountClient.account as Account,
        args: params.args ? [...params.args] : undefined,
        chain: this.chain
      })

      return await this.publicClient.waitForTransactionReceipt({
        hash: hash as Hash
      })
    } catch (error) {
      console.error('Error executing with smart account:', error)
      throw error
    }
  }

  private async executeWithEOA(
    params: ContractInteractionParams
  ): Promise<TransactionReceipt> {
    if (!this.publicClient) {
      throw new Error('Public client is not available')
    }

    try {
      const hash = await writeContract(this.config, {
        ...params,
        args: params.args ? [...params.args] : undefined,
        chain: this.chain
      })

      return await this.publicClient.waitForTransactionReceipt({
        hash
      })
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

export function useContractInteractor(
  chainId: number,
  smartAccountClient?: SmartAccountClient
): ContractInteractor {
  const config = useConfig()
  const chain = config.chains.find(c => c.id === chainId)!

  if (!chain) {
    throw new Error(`Chain with id ${chainId} not found in config`)
  }

  return new ContractInteractor(config, chain, smartAccountClient)
}
