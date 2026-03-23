import type { WeekRoadmapItem } from "./types"

export const ROAD_TO_WEB3_ROADMAP: WeekRoadmapItem[] = [
  {
    id: 1,
    slug: "develop-an-nft-smart-contract",
    title: "Develop an NFT Smart Contract",
    description: "ERC-721 fundamentals and first deployment",
    tutorialUrl: "https://www.web3.university/tracks/road-to-web3/develop-a-nft-smart-contract",
    status: "ready",
    networks: ["Sepolia"],
  },
  {
    id: 2,
    slug: "buy-me-a-coffee-defi-dapp",
    title: "Build a Buy Me a Coffee DeFi dApp",
    description: "Wallet connect, tips, and on-chain memos",
    tutorialUrl: "https://www.web3.university/tracks/road-to-web3/how-to-build-a-buy-me-a-coffee-defi-dapp",
    status: "ready",
    networks: ["Sepolia"],
  },
  {
    id: 3,
    slug: "on-chain-metadata-nfts",
    title: "Make NFTs with On-Chain Metadata",
    description: "Dynamic warrior NFTs with fully on-chain metadata",
    tutorialUrl: "https://www.web3.university/tracks/road-to-web3/how-to-make-nfts-with-on-chain-metadata",
    status: "ready",
    networks: ["Polygon Amoy"],
  },
  {
    id: 4,
    slug: "create-an-nft-gallery",
    title: "Create an NFT Gallery",
    description: "Search NFTs by wallet and collection",
    tutorialUrl: "https://www.web3.university/tracks/road-to-web3/create-an-nft-gallery",
    status: "ready",
    networks: ["Ethereum Mainnet"],
  },
  {
    id: 5,
    slug: "connect-apis-to-your-smart-contract",
    title: "Connect APIs to Your Smart Contract",
    description: "Off-chain data integration patterns",
    tutorialUrl: "https://www.web3.university/tracks/road-to-web3/connect-apis-to-your-smart-contract-with-chainlink",
    status: "stub",
    networks: ["Sepolia"],
  },
  {
    id: 6,
    slug: "build-a-staking-application",
    title: "Build a Staking Application",
    description: "Stake/unstake flows and rewards lifecycle",
    tutorialUrl: "https://www.web3.university/tracks/road-to-web3/build-a-staking-application",
    status: "ready",
    networks: ["Sepolia"],
  },
  {
    id: 7,
    slug: "build-an-nft-marketplace",
    title: "Build an NFT Marketplace",
    description: "Listings, purchases, and marketplace contracts",
    tutorialUrl: "https://www.web3.university/tracks/road-to-web3/build-an-nft-marketplace-from-scratch",
    status: "stub",
    networks: ["Sepolia"],
  },
  {
    id: 8,
    slug: "build-a-blockchain-betting-game",
    title: "Build a Blockchain Betting Game",
    description: "Game logic and settlement mechanics",
    tutorialUrl: "https://www.web3.university/tracks/road-to-web3/build-a-blockchain-betting-game-with-optimism",
    status: "stub",
    networks: ["Optimism"],
  },
  {
    id: 9,
    slug: "build-a-token-swap-dapp",
    title: "Build a Token Swap DApp",
    description: "Token swap UI and routing",
    tutorialUrl: "https://www.web3.university/tracks/road-to-web3/build-a-blockchain-betting-game",
    status: "stub",
    networks: ["Ethereum Mainnet"],
  },
  {
    id: 10,
    slug: "build-decentralized-twitter",
    title: "Build Decentralized Twitter",
    description: "Social protocol data model and interactions",
    tutorialUrl: "https://www.web3.university/tracks/road-to-web3/build-decentralized-twitter-with-lens",
    status: "stub",
    networks: ["Sepolia"],
  },
]

const HOMEPAGE_WEEK_IDS = [1, 2, 3, 4, 5, 6] as const

export function getWeekRoadmapItem(id: number): WeekRoadmapItem | undefined {
  return ROAD_TO_WEB3_ROADMAP.find(week => week.id === id)
}

export function getHomepageRoadmapItems() {
  const featuredWeekId = HOMEPAGE_WEEK_IDS[HOMEPAGE_WEEK_IDS.length - 1]

  return HOMEPAGE_WEEK_IDS.map(id => {
    const week = getWeekRoadmapItem(id)

    if (!week) {
      throw new Error(`Missing roadmap item for homepage week ${id}`)
    }

    return {
      ...week,
      href: `/weeks/${week.id}`,
      featured: week.id === featuredWeekId,
    }
  })
}
