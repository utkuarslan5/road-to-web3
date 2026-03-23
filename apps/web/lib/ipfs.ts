// IPFS gateway helpers
// Deprecated: This file is kept for backward compatibility
// New code should import from @/lib/services/ipfs instead

export {
  IPFS_GATEWAYS,
  isLikelyCid,
  buildGatewayUrls,
  fetchMetadata,
} from "./services/ipfs"

// decodeAbiString is still used, keep it here
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

