// Contract configurations for all weeks

import { SEPOLIA, POLYGON_AMOY } from "./chains"

export const COFFEE_ABI = [
  "function buyCoffee(string name, string message) public payable",
  "function memos() external view returns (tuple(address supporter, uint256 timestamp, string name, string message)[])",
] as const

export const CHAIN_BATTLES_ABI = [
  "function mint() external",
  "function train(uint256 tokenId) external",
  "function battle(uint256 attackerId, uint256 defenderId) external returns (bool)",
  "function statsOf(uint256 tokenId) external view returns (tuple(uint48 lastAction, uint16 level, uint16 power, uint16 agility, uint16 vitality, uint32 victories, uint32 defeats, uint8 rarity))",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
] as const

export const RARITY_LABELS = ["Common", "Uncommon", "Rare", "Epic", "Mythic"] as const

/**
 * Week 1 Configuration - LabMint Trophy
 */
export const WEEK1_CONFIG = {
  ...SEPOLIA,
  contractAddress: "0xc84a1D9044Ceb74EC8C17FfD465f1af6Fe0e53DF",
  tokenId: 0,
  callData: "0xc87b56dd0000000000000000000000000000000000000000000000000000000000000000",
  cacheKey: "utkulabs:week1:trophy",
} as const

/**
 * Week 2 Configuration - Buy Me a Coffee
 */
export const WEEK2_CONFIG = {
  ...SEPOLIA,
  contractAddress: "0x86a531F9Fa82E220B28c854C900178c37CFC9ab5",
  defaultAmountEth: "0.001",
} as const

/**
 * Week 3 Configuration - Chain Battles
 */
export const WEEK3_CONFIG = {
  ...POLYGON_AMOY,
  contractAddress: "0x7930FD2407eAc725319F85b693867f0aa81e6b7E",
  deployerAddress: "0x35313FB0881423D798BcFA3b68741c512Df31559", // Deployer address to show NFTs when wallet not connected
  cooldownSeconds: 60,
  defaultTokenId: 1, // Default token ID to try loading
} as const

