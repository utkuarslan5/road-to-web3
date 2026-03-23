// Centralized environment variable configuration

type NetworkName = "mainnet" | "sepolia" | "polygon-amoy"

// Next.js only guarantees client-side injection for statically referenced
// NEXT_PUBLIC_* variables (not dynamic process.env[name] lookups).
const NEXT_PUBLIC_ALCHEMY_MAINNET_API_KEY =
  process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_API_KEY?.trim() || ""
const NEXT_PUBLIC_ALCHEMY_API_KEY =
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY?.trim() || ""
const NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY =
  process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY?.trim() || ""
const NEXT_PUBLIC_ALCHEMY_POLYGON_AMOY_API_KEY =
  process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_AMOY_API_KEY?.trim() || ""

function getMainnetKeyFromEnv(): string {
  // Canonical key for this monorepo
  const canonical = NEXT_PUBLIC_ALCHEMY_MAINNET_API_KEY
  if (canonical) return canonical

  // Temporary compatibility alias during migration
  return NEXT_PUBLIC_ALCHEMY_API_KEY
}

export const env = {
  alchemyMainnetApiKey: getMainnetKeyFromEnv(),
  alchemySepoliaApiKey: NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY,
  alchemyPolygonAmoyApiKey: NEXT_PUBLIC_ALCHEMY_POLYGON_AMOY_API_KEY,
} as const

export function getAlchemyApiKey(network: NetworkName): string {
  if (network === "mainnet") {
    return env.alchemyMainnetApiKey
  }

  if (network === "sepolia") {
    return env.alchemySepoliaApiKey
  }

  return env.alchemyPolygonAmoyApiKey
}

export function getAlchemyRpcUrl(network: NetworkName, apiKey?: string): string {
  const baseUrl = `https://${network === "mainnet" ? "eth" : network === "sepolia" ? "eth-sepolia" : "polygon-amoy"}.g.alchemy.com/v2`

  let key = apiKey || getAlchemyApiKey(network)

  if (!key) {
    const fallbackKeys: Record<NetworkName, string> = {
      mainnet: "demo",
      sepolia: "KP7J8NeqBmLe2H7v1waHF",
      "polygon-amoy": "TkrgpEOpu3jxDokxXlWBg",
    }

    if (typeof window === "undefined") {
      const envHint =
        network === "mainnet"
          ? "Set NEXT_PUBLIC_ALCHEMY_MAINNET_API_KEY (or NEXT_PUBLIC_ALCHEMY_API_KEY) in .env.local"
          : `Set NEXT_PUBLIC_ALCHEMY_${network.toUpperCase().replace("-", "_")}_API_KEY in .env.local`

      console.warn(`Warning: Using fallback API key for ${network}. ${envHint}`)
    } else {
      console.warn(`Warning: Missing Alchemy key for ${network}; using fallback key.`)
    }

    key = fallbackKeys[network]
  }

  return `${baseUrl}/${key}`
}
