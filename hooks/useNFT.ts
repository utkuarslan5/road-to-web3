"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { fetchMetadata, buildGatewayUrls } from "@/lib/ipfs"

export interface NFTMetadata {
  name: string
  description: string
  image: string
  [key: string]: any
}

export function useNFT(rpcUrl: string, contractAddress: string, tokenId: number) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchNFT() {
      setLoading(true)
      setError(null)

      try {
        // Call tokenURI on contract using ethers v6 Interface API
        const iface = new ethers.Interface(["function tokenURI(uint256 tokenId) external view returns (string)"])
        const data = iface.encodeFunctionData("tokenURI", [tokenId])

        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_call",
            params: [
              {
                to: contractAddress,
                data,
              },
              "latest",
            ],
          }),
        })

        const body = await response.json()
        if (!body?.result) {
          throw new Error("No result from RPC")
        }

        if (cancelled) return

        const tokenUri = iface.decodeFunctionResult("tokenURI", body.result)[0] as string
        const urls = buildGatewayUrls(tokenUri)
        const fetchedMetadata = await fetchMetadata(urls)

        if (cancelled) return

        const imageUrls = buildGatewayUrls(fetchedMetadata.image || "")
        setMetadata(fetchedMetadata)
        setImageUrl(imageUrls[0] || "")
        setLoading(false)
      } catch (err: any) {
        if (cancelled) return
        setError(err.message || "Failed to fetch NFT")
        setLoading(false)
      }
    }

    fetchNFT()

    return () => {
      cancelled = true
    }
  }, [rpcUrl, contractAddress, tokenId])

  return {
    metadata,
    imageUrl,
    loading,
    error,
  }
}

