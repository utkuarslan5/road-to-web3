// Chain configurations

import { getAlchemyRpcUrl } from "./env"

export interface ChainConfig {
  chainId: bigint
  chainIdHex: string
  chainName: string
  explorer: string
  rpcUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export const SEPOLIA: ChainConfig = {
  chainId: 11155111n,
  chainIdHex: "0xaa36a7",
  chainName: "Sepolia",
  explorer: "https://sepolia.etherscan.io",
  rpcUrl: getAlchemyRpcUrl("sepolia"),
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
}

export const POLYGON_AMOY: ChainConfig = {
  chainId: 80002n,
  chainIdHex: "0x13882",
  chainName: "Polygon Amoy",
  explorer: "https://amoy.polygonscan.com",
  rpcUrl: getAlchemyRpcUrl("polygon-amoy"),
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
}

export const ETHEREUM_MAINNET: ChainConfig = {
  chainId: 1n,
  chainIdHex: "0x1",
  chainName: "Ethereum Mainnet",
  explorer: "https://etherscan.io",
  rpcUrl: getAlchemyRpcUrl("mainnet"),
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
}

/**
 * Get chain configuration by name
 */
export function getChainConfig(chainName: "sepolia" | "polygon-amoy" | "mainnet"): ChainConfig {
  switch (chainName) {
    case "sepolia":
      return SEPOLIA
    case "polygon-amoy":
      return POLYGON_AMOY
    case "mainnet":
      return ETHEREUM_MAINNET
    default:
      throw new Error(`Unknown chain: ${chainName}`)
  }
}

