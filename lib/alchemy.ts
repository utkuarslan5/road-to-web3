// Alchemy NFT API client

import { convertIpfsUrl } from "./services/ipfs"

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "YOUR_API_KEY_HERE"
const BASE_URL = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`

export interface NFT {
  contract: {
    address: string
    name?: string
    symbol?: string
    totalSupply?: string
    tokenType?: string
    contractDeployer?: string
    deployedBlockNumber?: number
    openSeaMetadata?: any
    isSpam?: any
    spamClassifications?: any[]
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
      attributes?: any[]
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
  // Legacy fields for backward compatibility with getNFTs endpoint
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

export interface AlchemyNFTResponse {
  ownedNfts: NFT[]
  pageKey?: string
  totalCount: number
}

export interface AlchemyCollectionResponse {
  nfts: NFT[]
  nextToken?: string
}

export class AlchemyService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || ALCHEMY_API_KEY
    this.baseUrl = `https://eth-mainnet.g.alchemy.com/nft/v3/${this.apiKey}`
  }

  async getNFTsByWallet(
    address: string,
    pageSize: number = 100,
    pageKey?: string
  ): Promise<AlchemyNFTResponse> {
    // Normalize address (ensure it starts with 0x and is lowercase)
    const normalizedAddress = address.trim().toLowerCase()
    const cleanAddress = normalizedAddress.startsWith('0x') 
      ? normalizedAddress 
      : `0x${normalizedAddress}`

    // Validate address format (basic check - 0x followed by 40 hex characters)
    if (!/^0x[a-f0-9]{40}$/.test(cleanAddress)) {
      throw new Error(`Invalid wallet address: ${address}`)
    }

    const params = new URLSearchParams({
      owner: cleanAddress,
      pageSize: pageSize.toString(),
      withMetadata: "true",
    })
    
    if (pageKey) {
      params.append("pageKey", pageKey)
    }

    // Always fetch fresh data (no cache)
    // Use getNFTsForOwner endpoint (Alchemy API v3) instead of deprecated getNFTs
    const url = `${this.baseUrl}/getNFTsForOwner?${params}`
    
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      
      if (!response.ok) {
        // Try to get error details from response
        console.error(`Alchemy API request failed: ${response.status} ${response.statusText}`)
        console.error(`Request URL: ${url.replace(this.apiKey, 'API_KEY_HIDDEN')}`)
        
        let errorMessage = `Alchemy API error (${response.status}): ${response.statusText}`
        try {
          const errorText = await response.text()
          console.error("Alchemy API error response body:", errorText)
          
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText }
          }
          
          if (errorData.message) {
            errorMessage = `Alchemy API error: ${errorData.message}`
          } else if (errorData.error) {
            errorMessage = `Alchemy API error: ${typeof errorData.error === 'string' 
              ? errorData.error 
              : JSON.stringify(errorData.error)}`
          } else if (errorText && errorText.length > 0) {
            errorMessage = `Alchemy API error: ${errorText.substring(0, 500)}`
          }
        } catch (e) {
          // If we can't parse the error, use the status text
          console.error("Error parsing API error response:", e)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Alchemy API might return pageKey - normalize it (convert empty string to undefined)
      if (data && data.pageKey && data.pageKey.trim() === "") {
        data.pageKey = undefined
      }
      
      return data
    } catch (error: any) {
      
      // If it's already an Error we threw, re-throw it
      if (error instanceof Error) {
        throw error
      }
      // Otherwise, wrap it
      throw new Error(`Failed to fetch NFTs: ${error?.message || String(error)}`)
    }
  }

  async getNFTsByCollection(
    contractAddress: string,
    pageSize: number = 100,
    startToken?: string
  ): Promise<AlchemyCollectionResponse> {
    const params = new URLSearchParams({
      contractAddress,
      withMetadata: "true",
      limit: pageSize.toString(),
    })
    
    if (startToken) {
      params.append("startToken", startToken)
    }

    // Always fetch fresh data (no cache)
    const response = await fetch(`${this.baseUrl}/getNFTsForCollection?${params}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Alchemy API error: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    // Alchemy API might return nextToken or pageKey - normalize to nextToken
    // Also handle cases where the field might be missing or empty
    if (data && !data.nextToken) {
      // Check for alternative field names
      if (data.pageKey) {
        data.nextToken = data.pageKey
      }
    }
    
    return data
  }

  getImageUrl(nft: NFT): string {
    // Priority 1: Try image.cachedUrl (Alchemy's v3 API structure - most reliable)
    if (nft.image?.cachedUrl) {
      const url = convertIpfsUrl(nft.image.cachedUrl)
      if (url) return url
    }
    
    // Priority 2: Try image.pngUrl (Alchemy's converted PNG)
    if (nft.image?.pngUrl) {
      const url = convertIpfsUrl(nft.image.pngUrl)
      if (url) return url
    }
    
    // Priority 3: Try image.thumbnailUrl (smaller but faster)
    if (nft.image?.thumbnailUrl) {
      const url = convertIpfsUrl(nft.image.thumbnailUrl)
      if (url) return url
    }
    
    // Priority 4: Try image.originalUrl (original IPFS URL - convert to gateway)
    if (nft.image?.originalUrl) {
      const url = convertIpfsUrl(nft.image.originalUrl)
      if (url) return url
    }
    
    // Priority 5: Try raw.metadata.image (from v3 API structure)
    if (nft.raw?.metadata?.image) {
      const url = convertIpfsUrl(nft.raw.metadata.image)
      if (url) return url
    }
    
    // Priority 6: Try legacy media gateway (for getNFTs endpoint compatibility)
    if (nft.media && Array.isArray(nft.media) && nft.media.length > 0) {
      const mediaItem = nft.media[0]
      if (mediaItem.gateway) {
        const url = convertIpfsUrl(mediaItem.gateway)
        if (url) return url
      }
      if (mediaItem.raw) {
        const url = convertIpfsUrl(mediaItem.raw)
        if (url) return url
      }
    }
    
    // Priority 7: Try legacy metadata image (for getNFTs endpoint compatibility)
    if (nft.metadata?.image) {
      const url = convertIpfsUrl(nft.metadata.image)
      if (url) return url
    }
    
    return ""
  }

  getNFTName(nft: NFT): string {
    
    const result = (
      nft.name ||
      nft.title ||
      nft.raw?.metadata?.name ||
      nft.metadata?.name ||
      `${nft.contract.name || "NFT"} #${nft.tokenId}`
    )
    
    return result
  }

  getNFTDescription(nft: NFT): string {
    
    const result = (
      nft.description ||
      nft.raw?.metadata?.description ||
      nft.metadata?.description ||
      ""
    )
    
    return result
  }
}
