"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { RARITY_LABELS } from "@/lib/contracts"
import { getProvider, getContract } from "@/lib/ethers"
import { WEEK3_CONFIG, CHAIN_BATTLES_ABI } from "@/lib/contracts"
import { ethers } from "ethers"
import { useEffect, useState } from "react"

interface WarriorCardProps {
  tokenId: number
  isSelected: boolean
  onClick: () => void
}

function WarriorCard({ tokenId, isSelected, onClick }: WarriorCardProps) {
  const [svgData, setSvgData] = useState<string>("")
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWarrior() {
      try {
        setLoading(true)
        const provider = getProvider() || new ethers.JsonRpcProvider(WEEK3_CONFIG.rpcUrl)
        const contract = getContract(WEEK3_CONFIG.contractAddress, CHAIN_BATTLES_ABI, provider)

        const [tokenURI, statsData] = await Promise.all([
          contract.tokenURI(tokenId),
          contract.statsOf(tokenId),
        ])

        setStats({
          level: Number(statsData.level),
          rarity: Number(statsData.rarity),
        })

        // Parse SVG from tokenURI
        if (tokenURI.startsWith("data:application/json;base64,")) {
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
        }
      } catch (err) {
        console.error("Failed to load warrior:", err)
      } finally {
        setLoading(false)
      }
    }

    loadWarrior()
  }, [tokenId])

  if (loading) {
    return (
      <Card className={`p-3 cursor-pointer transition-all ${isSelected ? "ring-2 ring-accent-cyan" : ""}`}>
        <Skeleton className="w-full aspect-square mb-2" />
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </Card>
    )
  }

  return (
    <Card
      className={`p-3 cursor-pointer transition-all hover:scale-105 ${
        isSelected ? "ring-2 ring-accent-cyan bg-accent-cyan/10" : ""
      }`}
      onClick={onClick}
    >
      <div className="w-full aspect-square rounded overflow-hidden bg-white/5 mb-2">
        {svgData ? (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: svgData }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            #{tokenId}
          </div>
        )}
      </div>
      <div className="text-xs font-semibold mb-1">#{tokenId}</div>
      {stats && (
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="secondary" className="text-xs">
            Lv.{stats.level}
          </Badge>
          <span className="text-muted-foreground">{RARITY_LABELS[stats.rarity]}</span>
        </div>
      )}
    </Card>
  )
}

interface WarriorListProps {
  tokenIds: number[]
  loading: boolean
  error: string | null
  selectedTokenId: number | null
  onSelectToken: (tokenId: number) => void
  title?: string
}

export function WarriorList({ tokenIds, loading, error, selectedTokenId, onSelectToken, title }: WarriorListProps) {

  if (loading) {
    return (
      <Card className="glass p-6">
        <h3 className="text-xl font-bold mb-4">{title || "Warriors"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full aspect-square" />
          ))}
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass p-6">
        <h3 className="text-xl font-bold mb-4">{title || "Warriors"}</h3>
        <div className="text-center text-destructive py-4">
          <p>{error}</p>
        </div>
      </Card>
    )
  }

  if (tokenIds.length === 0) {
    return (
      <Card className="glass p-6">
        <h3 className="text-xl font-bold mb-4">{title || "Warriors"}</h3>
        <div className="text-center text-muted-foreground py-8">
          <p>No warriors found. Mint your first warrior to get started!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass p-6">
      <h3 className="text-xl font-bold mb-4">
        {title || "Warriors"} ({tokenIds.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tokenIds.map((tokenId) => (
          <WarriorCard
            key={tokenId}
            tokenId={tokenId}
            isSelected={selectedTokenId === tokenId}
            onClick={() => onSelectToken(tokenId)}
          />
        ))}
      </div>
    </Card>
  )
}

