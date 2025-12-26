// Chain configurations

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
  rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/KP7J8NeqBmLe2H7v1waHF",
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
  rpcUrl: "https://polygon-amoy.g.alchemy.com/v2/TkrgpEOpu3jxDokxXlWBg",
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
  rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
}

