// Ethers.js wrapper types

import type { ethers } from "ethers"

/**
 * Wallet connection state
 */
export interface WalletState {
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

/**
 * Contract method options for transactions
 */
export interface ContractTransactionOptions {
  value?: bigint | string
  gasLimit?: bigint | number
}

/**
 * Generic contract interface for type-safe contract calls
 */
export interface ContractCallResult<T = unknown> {
  data: T
}

