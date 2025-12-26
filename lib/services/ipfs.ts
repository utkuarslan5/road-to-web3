// IPFS service - centralized IPFS gateway logic

export const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://nftstorage.link/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
] as const

/**
 * Check if a value is likely a CID (Content Identifier)
 */
export function isLikelyCid(value: string): boolean {
  return /^(?:Qm[1-9A-HJ-NP-Za-km-z]{44,}|bafy[0-9a-z]{50,})$/i.test(value)
}

/**
 * Convert IPFS URL to gateway URL
 * Returns the first gateway URL (cloudflare-ipfs as default)
 */
export function ipfsToGateway(url: string): string {
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

/**
 * Build array of gateway URLs for a given IPFS URI
 * Returns all possible gateway URLs for fallback
 */
export function buildGatewayUrls(uri: string): string[] {
  if (!uri) return []
  
  // Handle data URIs
  if (uri.startsWith("data:")) {
    return [uri]
  }
  
  // Handle HTTP/HTTPS URLs
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return [uri]
  }
  
  // Handle ipfs:// protocol
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "")
    return IPFS_GATEWAYS.map(gateway => `${gateway}${cid}`)
  }
  
  // Handle direct CID
  if (isLikelyCid(uri)) {
    return IPFS_GATEWAYS.map(gateway => `${gateway}${uri}`)
  }
  
  // Try to extract CID from path
  const cidMatch = uri.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44,}|bafy[0-9a-z]{50,})/i)
  if (cidMatch) {
    const cid = cidMatch[1]
    return IPFS_GATEWAYS.map(gateway => `${gateway}${cid}`)
  }
  
  return [uri]
}

/**
 * Fetch metadata from URLs with fallback
 * Tries each URL in order until one succeeds
 */
export async function fetchMetadata(urls: string | string[]): Promise<any> {
  const attempts = Array.isArray(urls) ? urls : [urls]
  
  for (const url of attempts) {
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (res.ok) {
        return await res.json()
      }
    } catch (err) {
      console.warn(`Failed to fetch ${url}:`, err)
    }
  }
  
  throw new Error("Metadata fetch failed from all gateways")
}

/**
 * Convert IPFS URL to gateway URL with validation
 * Handles various URL formats and returns a single gateway URL
 */
export function convertIpfsUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return ""
  
  const cleaned = url.trim()
  if (!cleaned || cleaned === "null" || cleaned === "undefined" || cleaned === "") return ""
  
  // If already HTTP/HTTPS, return as-is
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned
  }
  
  // Convert IPFS URLs
  if (cleaned.startsWith("ipfs://")) {
    return ipfsToGateway(cleaned)
  }
  
  // Try to extract and convert CID
  return ipfsToGateway(cleaned)
}

