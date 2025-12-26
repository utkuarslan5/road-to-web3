// Contract configurations for all weeks

// Get API keys from environment variables (fallback to hardcoded for backwards compatibility)
const ALCHEMY_SEPOLIA_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY || "KP7J8NeqBmLe2H7v1waHF"
const ALCHEMY_POLYGON_AMOY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_AMOY_API_KEY || "TkrgpEOpu3jxDokxXlWBg"

export const WEEK1_CONFIG = {
  rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_API_KEY}`,
  contractAddress: "0xc84a1D9044Ceb74EC8C17FfD465f1af6Fe0e53DF",
  tokenId: 0,
  callData: "0xc87b56dd0000000000000000000000000000000000000000000000000000000000000000",
  cacheKey: "utkulabs:week1:trophy",
} as const

export const WEEK2_CONFIG = {
  contractAddress: "0x86a531F9Fa82E220B28c854C900178c37CFC9ab5",
  chainId: 11155111n,
  chainIdHex: "0xaa36a7",
  chainName: "Sepolia",
  explorer: "https://sepolia.etherscan.io",
  rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_API_KEY}`,
  defaultAmountEth: "0.001",
} as const

export const WEEK3_CONFIG = {
  contractAddress: "0x7930FD2407eAc725319F85b693867f0aa81e6b7E",
  deployerAddress: "0x35313FB0881423D798BcFA3b68741c512Df31559", // Deployer address to show NFTs when wallet not connected
  chainId: 80002n,
  chainIdHex: "0x13882",
  chainName: "Polygon Amoy",
  explorer: "https://amoy.polygonscan.com",
  rpcUrl: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_POLYGON_AMOY_API_KEY}`,
  cooldownSeconds: 60,
  defaultTokenId: 1, // Default token ID to try loading
} as const

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

