// API response types

/**
 * NFT interface from Alchemy API
 * This matches the structure from lib/alchemy.ts
 */
export interface NFT {
  contract: {
    address: string
    name?: string
    symbol?: string
    totalSupply?: string
    tokenType?: string
    contractDeployer?: string
    deployedBlockNumber?: number
    openSeaMetadata?: unknown
    isSpam?: unknown
    spamClassifications?: unknown[]
  }
  tokenId: string
  tokenType?: string
  name?: string
  description?: string
  title?: string
  tokenUri?: string
  image?: {
    cachedUrl?: string
    thumbnailUrl?: string
    pngUrl?: string
    contentType?: string
    size?: number
    originalUrl?: string
  }
  animation?: {
    cachedUrl?: string | null
    contentType?: string | null
    size?: number | null
    originalUrl?: string | null
  }
  raw?: {
    tokenUri?: string
    metadata?: {
      name?: string
      description?: string
      image?: string
      attributes?: unknown[]
    }
    error?: string | null
  }
  collection?: {
    name?: string
    slug?: string
    externalUrl?: string | null
    bannerImageUrl?: string
  }
  mint?: {
    mintAddress?: string | null
    blockNumber?: number | null
    timestamp?: string | null
    transactionHash?: string | null
  }
  owners?: string[] | null
  timeLastUpdated?: string
  // Legacy fields for backward compatibility
  media?: Array<{
    gateway?: string
    raw?: string
  }>
  metadata?: {
    name?: string
    description?: string
    image?: string
  }
}

/**
 * Alchemy API response for wallet NFT queries
 */
export interface AlchemyNFTResponse {
  ownedNfts: NFT[]
  pageKey?: string
  totalCount: number
}

/**
 * Alchemy API response for collection NFT queries
 */
export interface AlchemyCollectionResponse {
  nfts: NFT[]
  nextToken?: string
}

/**
 * NFT metadata from tokenURI
 */
export interface NFTMetadata {
  name: string
  description: string
  image: string
  [key: string]: unknown
}

