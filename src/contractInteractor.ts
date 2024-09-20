import { Config, getPublicClient, writeContract } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { Abi, Address, Chain, Hash, PublicClient } from 'viem'

export interface TransactionReceipt {
  transactionHash: Hash
  blockNumber: bigint
  status: 'success' | 'reverted'
}

export interface ContractInteractionParams {
  address: Address
  abi: Abi
  functionName: string
  args?: readonly unknown[]
  value?: bigint
}

export class ContractInteractor {
  private config: Config
  private smartAccountClient?: SmartAccountClient
  private chain: Chain
  private publicClient: PublicClient | undefined

  constructor(
    config: Config,
    chain: Chain,
    smartAccountClient?: SmartAccountClient
  ) {
    this.config = config
    this.chain = chain
    this.smartAccountClient = smartAccountClient
    this.publicClient = getPublicClient(config)

    if (!this.publicClient) {
      throw new Error('Failed to initialize public client')
    }
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
    if (!this.publicClient) {
      throw new Error('Public client is not available')
    }

    try {
      const hash = await (this.smartAccountClient as any).writeContract({
        ...params,
        args: params.args ? [...params.args] : undefined,
        chain: this.chain
      })

      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash
      })

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
    if (!this.publicClient) {
      throw new Error('Public client is not available')
    }

    try {
      const hash = await writeContract(this.config, {
        ...params,
        args: params.args ? [...params.args] : undefined,
        chain: this.chain
      })

      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash
      })

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
