// IPFS gateway helpers

export const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://nftstorage.link/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
] as const

export function isLikelyCid(value: string): boolean {
  return /^(?:Qm[1-9A-HJ-NP-Za-km-z]{44,}|bafy[0-9a-z]{50,})$/i.test(value)
}

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

export function decodeAbiString(hex: string): string {
  // Remove 0x prefix
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex
  
  // Skip function selector (first 8 chars) and offset (next 64 chars)
  // Then read length (next 64 chars) and data
  if (cleanHex.length < 136) {
    throw new Error("Invalid hex string length")
  }
  
  const lengthHex = cleanHex.slice(136, 200)
  const length = parseInt(lengthHex, 16)
  
  if (length === 0) {
    return ""
  }
  
  const dataHex = cleanHex.slice(200, 200 + length * 2)
  const bytes = []
  for (let i = 0; i < dataHex.length; i += 2) {
    bytes.push(parseInt(dataHex.slice(i, i + 2), 16))
  }
  
  // Convert bytes to string, removing null bytes
  return new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0/g, "")
}

