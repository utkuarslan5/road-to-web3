// Alchemy NFT API client

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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'alchemy.ts:95',message:'getNFTsByWallet entry',data:{address,pageSize,pageKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
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
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'alchemy.ts:122',message:'API request URL',data:{url:url.replace(this.apiKey,'API_KEY_HIDDEN'),cleanAddress,params:params.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'alchemy.ts:131',message:'API response status',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (!response.ok) {
        // Try to get error details from response
        console.error(`Alchemy API request failed: ${response.status} ${response.statusText}`)
        console.error(`Request URL: ${url.replace(this.apiKey, 'API_KEY_HIDDEN')}`)
        
        let errorMessage = `Alchemy API error (${response.status}): ${response.statusText}`
        try {
          const errorText = await response.text()
          console.error("Alchemy API error response body:", errorText)
          
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'alchemy.ts:142',message:'API error response',data:{errorText:errorText.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
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
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'alchemy.ts:166',message:'API response data structure',data:{hasOwnedNfts:!!data.ownedNfts,ownedNftsLength:data.ownedNfts?.length||0,keys:Object.keys(data),firstNftKeys:data.ownedNfts?.[0]?Object.keys(data.ownedNfts[0]):[],firstNftName:data.ownedNfts?.[0]?.name,firstNftTitle:data.ownedNfts?.[0]?.title,firstNftRawMetadata:!!data.ownedNfts?.[0]?.raw?.metadata,firstNftMetadata:!!data.ownedNfts?.[0]?.metadata},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      return data
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'alchemy.ts:169',message:'getNFTsByWallet error',data:{errorMessage:error?.message,errorType:error?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
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
      pageSize: pageSize.toString(),
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
      throw new Error(`Alchemy API error: ${response.statusText}`)
    }

    return await response.json()
  }

  getImageUrl(nft: NFT): string {
    // Helper function to convert IPFS URL to gateway URL
    const ipfsToGateway = (url: string): string => {
      if (!url || typeof url !== 'string') return ""
      
      if (url.startsWith("ipfs://")) {
        const cid = url.replace("ipfs://", "").replace(/\/$/, "")
        return `https://cloudflare-ipfs.com/ipfs/${cid}`
      }
      
      // Try to extract CID from various formats
      const cidPattern = /(Qm[1-9A-HJ-NP-Za-km-z]{44,}|bafy[0-9a-z]{50,})/i
      const cidMatch = url.match(cidPattern)
      if (cidMatch && cidMatch[1]) {
        return `https://cloudflare-ipfs.com/ipfs/${cidMatch[1]}`
      }
      
      return url
    }
    
    // Helper to validate and clean URL
    const cleanUrl = (url: any): string => {
      if (!url || typeof url !== 'string') return ""
      const cleaned = url.trim()
      if (!cleaned || cleaned === "null" || cleaned === "undefined" || cleaned === "") return ""
      return cleaned
    }
    
    // Priority 1: Try image.cachedUrl (Alchemy's v3 API structure - most reliable)
    if (nft.image?.cachedUrl) {
      const cachedUrl = cleanUrl(nft.image.cachedUrl)
      if (cachedUrl) return cachedUrl
    }
    
    // Priority 2: Try image.pngUrl (Alchemy's converted PNG)
    if (nft.image?.pngUrl) {
      const pngUrl = cleanUrl(nft.image.pngUrl)
      if (pngUrl) return pngUrl
    }
    
    // Priority 3: Try image.thumbnailUrl (smaller but faster)
    if (nft.image?.thumbnailUrl) {
      const thumbnailUrl = cleanUrl(nft.image.thumbnailUrl)
      if (thumbnailUrl) return thumbnailUrl
    }
    
    // Priority 4: Try image.originalUrl (original IPFS URL - convert to gateway)
    if (nft.image?.originalUrl) {
      const originalUrl = cleanUrl(nft.image.originalUrl)
      if (originalUrl) {
        if (originalUrl.startsWith("ipfs://")) {
          return ipfsToGateway(originalUrl)
        }
        if (originalUrl.startsWith("http://") || originalUrl.startsWith("https://")) {
          return originalUrl
        }
        return ipfsToGateway(originalUrl)
      }
    }
    
    // Priority 5: Try raw.metadata.image (from v3 API structure)
    if (nft.raw?.metadata?.image) {
      const imageUrl = cleanUrl(nft.raw.metadata.image)
      if (imageUrl) {
        if (imageUrl.startsWith("ipfs://")) {
          return ipfsToGateway(imageUrl)
        }
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
          return imageUrl
        }
        return ipfsToGateway(imageUrl)
      }
    }
    
    // Priority 6: Try legacy media gateway (for getNFTs endpoint compatibility)
    if (nft.media && Array.isArray(nft.media) && nft.media.length > 0) {
      const mediaItem = nft.media[0]
      if (mediaItem.gateway) {
        const gateway = cleanUrl(mediaItem.gateway)
        if (gateway) return gateway
      }
      if (mediaItem.raw) {
        const rawUrl = cleanUrl(mediaItem.raw)
        if (rawUrl) {
          if (rawUrl.startsWith("ipfs://")) {
            return ipfsToGateway(rawUrl)
          }
          if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
            return rawUrl
          }
          return ipfsToGateway(rawUrl)
        }
      }
    }
    
    // Priority 7: Try legacy metadata image (for getNFTs endpoint compatibility)
    if (nft.metadata?.image) {
      const imageUrl = cleanUrl(nft.metadata.image)
      if (imageUrl) {
        if (imageUrl.startsWith("ipfs://")) {
          return ipfsToGateway(imageUrl)
        }
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
          return imageUrl
        }
        return ipfsToGateway(imageUrl)
      }
    }
    
    return ""
  }

  getNFTName(nft: NFT): string {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'alchemy.ts:319',message:'getNFTName entry',data:{hasName:!!nft.name,hasTitle:!!nft.title,hasRawMetadataName:!!nft.raw?.metadata?.name,hasMetadataName:!!nft.metadata?.name,name:nft.name,title:nft.title,rawMetadataName:nft.raw?.metadata?.name,metadataName:nft.metadata?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    const result = (
      nft.name ||
      nft.title ||
      nft.raw?.metadata?.name ||
      nft.metadata?.name ||
      `${nft.contract.name || "NFT"} #${nft.tokenId}`
    )
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'alchemy.ts:327',message:'getNFTName result',data:{result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    return result
  }

  getNFTDescription(nft: NFT): string {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'alchemy.ts:329',message:'getNFTDescription entry',data:{hasDescription:!!nft.description,hasRawMetadataDescription:!!nft.raw?.metadata?.description,hasMetadataDescription:!!nft.metadata?.description},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    const result = (
      nft.description ||
      nft.raw?.metadata?.description ||
      nft.metadata?.description ||
      ""
    )
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'alchemy.ts:337',message:'getNFTDescription result',data:{result,resultLength:result?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    return result
  }
}

