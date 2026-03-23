const fs = require("node:fs")
const path = require("node:path")

function loadEnvFile(fileName) {
  const envPath = path.resolve(__dirname, "..", "..", fileName)
  if (!fs.existsSync(envPath)) return

  const contents = fs.readFileSync(envPath, "utf8")
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const equalsIndex = line.indexOf("=")
    if (equalsIndex <= 0) continue

    const key = line.slice(0, equalsIndex).trim()
    if (!key) continue

    let value = line.slice(equalsIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

// Allow using monorepo-root env files while running Next from apps/web.
loadEnvFile(".env")
loadEnvFile(".env.local")

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  experimental: {
    externalDir: true,
  },
  transpilePackages: [
    "@road/config",
    "@road/shared",
    "@road/week-01",
    "@road/week-02",
    "@road/week-03",
    "@road/week-04",
    "@road/week-05",
    "@road/week-06",
    "@road/week-07",
    "@road/week-08",
    "@road/week-09",
    "@road/week-10",
  ],
  ...(process.env.NODE_ENV === "production" && {
    basePath: "/road-to-web3",
    assetPrefix: "/road-to-web3",
  }),
}

module.exports = nextConfig
