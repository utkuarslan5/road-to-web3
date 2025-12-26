// Centralized environment variable configuration

/**
 * Get environment variable with optional validation
 */
function getEnvVar(name: string, required: boolean = false): string {
  const value = process.env[name]
  
  if (required && !value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please set it in your .env.local file.`
    )
  }
  
  return value || ""
}

/**
 * Environment configuration
 * All API keys should be set via environment variables
 */
export const env = {
  // Alchemy API Keys
  alchemyApiKey: getEnvVar("NEXT_PUBLIC_ALCHEMY_API_KEY", false),
  alchemySepoliaApiKey: getEnvVar("NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY", false),
  alchemyPolygonAmoyApiKey: getEnvVar("NEXT_PUBLIC_ALCHEMY_POLYGON_AMOY_API_KEY", false),
} as const

/**
 * Build Alchemy RPC URL for a given network
 */
export function getAlchemyRpcUrl(network: "mainnet" | "sepolia" | "polygon-amoy", apiKey?: string): string {
  const baseUrl = `https://${network === "mainnet" ? "eth" : network === "sepolia" ? "eth-sepolia" : "polygon-amoy"}.g.alchemy.com/v2`
  
  // Use provided key, or try to get from env, or use fallback for development
  let key = apiKey
  
  if (!key) {
    if (network === "mainnet") {
      key = env.alchemyApiKey
    } else if (network === "sepolia") {
      key = env.alchemySepoliaApiKey
    } else if (network === "polygon-amoy") {
      key = env.alchemyPolygonAmoyApiKey
    }
  }
  
  // For development/testing, we'll allow fallback keys but warn in console
  if (!key) {
    const fallbackKeys: Record<string, string> = {
      sepolia: "KP7J8NeqBmLe2H7v1waHF",
      "polygon-amoy": "TkrgpEOpu3jxDokxXlWBg",
    }
    
    if (fallbackKeys[network]) {
      if (typeof window === "undefined") {
        console.warn(
          `Warning: Using fallback API key for ${network}. ` +
          `Set NEXT_PUBLIC_ALCHEMY_${network.toUpperCase().replace("-", "_")}_API_KEY in .env.local`
        )
      }
      key = fallbackKeys[network]
    } else {
      throw new Error(
        `Missing Alchemy API key for ${network}. ` +
        `Set NEXT_PUBLIC_ALCHEMY_${network.toUpperCase().replace("-", "_")}_API_KEY in .env.local`
      )
    }
  }
  
  return `${baseUrl}/${key}`
}

