"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { WEEK3_CONFIG, CHAIN_BATTLES_ABI } from "@/lib/contracts"
import { getProvider, getContract } from "@/lib/ethers"
import { ethers } from "ethers"

interface WarriorStats {
  lastAction: bigint
  level: number
  power: number
  agility: number
  vitality: number
  victories: number
  defeats: number
  rarity: number
}

export function WarriorDisplay({ tokenId, refreshKey }: { tokenId: number | null; refreshKey?: number }) {
  const [svgData, setSvgData] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenId) {
      setLoading(false)
      return
    }

    async function fetchWarrior() {
      try {
        setLoading(true)
        setError(null)

        const provider = getProvider() || new ethers.JsonRpcProvider(WEEK3_CONFIG.rpcUrl)
        const contract = getContract(WEEK3_CONFIG.contractAddress, CHAIN_BATTLES_ABI, provider)
        
        const tokenURI = await contract.tokenURI(tokenId)

        // Handle different data URI formats
        if (tokenURI.startsWith("data:image/svg+xml;utf8,")) {
          // Direct SVG data URI (utf8)
          setSvgData(decodeURIComponent(tokenURI.split(",")[1]))
        } else if (tokenURI.startsWith("data:image/svg+xml;base64,")) {
          // Direct SVG data URI (base64)
          setSvgData(atob(tokenURI.split(",")[1]))
        } else if (tokenURI.startsWith("data:application/json;base64,")) {
          // JSON metadata with base64 encoded image
          const json = JSON.parse(atob(tokenURI.split(",")[1]))
          if (json.image) {
            if (json.image.startsWith("data:image/svg+xml;base64,")) {
              setSvgData(atob(json.image.split(",")[1]))
            } else if (json.image.startsWith("data:image/svg+xml;utf8,")) {
              setSvgData(decodeURIComponent(json.image.split(",")[1]))
            } else {
              setSvgData(json.image)
            }
          }
        } else {
          // Try to fetch from URL
          const response = await fetch(tokenURI, { cache: "no-store" })
          const json = await response.json()
          if (json.image) {
            if (json.image.startsWith("data:image/svg+xml;base64,")) {
              setSvgData(atob(json.image.split(",")[1]))
            } else if (json.image.startsWith("data:image/svg+xml;utf8,")) {
              setSvgData(decodeURIComponent(json.image.split(",")[1]))
            } else {
              setSvgData(json.image)
            }
          }
        }
      } catch (err: any) {
        // Provide user-friendly error messages
        if (err.message?.includes("execution reverted") || err.message?.includes("require")) {
          setError(`Token ID ${tokenId} does not exist. Mint a warrior first!`)
        } else {
          setError(err.message || "Failed to load warrior")
        }
        setSvgData("")
      } finally {
        setLoading(false)
      }
    }

    fetchWarrior()
  }, [tokenId, refreshKey])

  if (loading) {
    return (
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold">YOUR WARRIOR</span>
          <Badge variant="secondary">Polygon Amoy</Badge>
        </div>
        <Skeleton className="w-full aspect-square mb-4" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass p-6">
        <div className="text-center text-destructive">
          <p>{error}</p>
        </div>
      </Card>
    )
  }

  if (!tokenId || !svgData) {
    return (
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold">YOUR WARRIOR</span>
          <Badge variant="secondary">Polygon Amoy</Badge>
        </div>
        <div className="aspect-square flex items-center justify-center text-muted-foreground">
          <p>No warrior selected</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold">YOUR WARRIOR</span>
        <Badge variant="secondary">Polygon Amoy</Badge>
      </div>
      <div
        className="w-full aspect-square rounded-lg overflow-hidden bg-white/5"
        dangerouslySetInnerHTML={{ __html: svgData }}
      />
    </Card>
  )
}

