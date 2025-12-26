"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { RARITY_LABELS } from "@/lib/contracts"
import { getProvider, getContract } from "@/lib/ethers"
import { WEEK3_CONFIG, CHAIN_BATTLES_ABI } from "@/lib/contracts"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { Swords } from "lucide-react"

interface WarriorCardProps {
  tokenId: number
  isSelected: boolean
  onClick: () => void
  refreshKey?: number
}

function WarriorCard({ tokenId, isSelected, onClick, refreshKey }: WarriorCardProps) {
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
  }, [tokenId, refreshKey])

  if (loading) {
    return (
      <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected ? "border-week3 shadow-glow-week3" : "border-border"
      }`}>
        <Skeleton className="w-full aspect-square rounded mb-2" />
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
    )
  }

  return (
    <div
      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] bg-screen ${
        isSelected
          ? "border-week3 shadow-glow-week3 bg-week3/10"
          : "border-border hover:border-week3/50"
      }`}
      onClick={onClick}
    >
      <div className="w-full aspect-square rounded overflow-hidden bg-cabinet mb-2">
        {svgData ? (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: svgData }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="font-mono text-xs">#{tokenId}</span>
          </div>
        )}
      </div>
      <div className="font-mono text-xs font-bold text-week3 mb-1">#{tokenId}</div>
      {stats && (
        <div className="flex items-center gap-2">
          <Badge variant="week3" className="text-[10px] px-1.5 py-0">
            LV.{stats.level}
          </Badge>
          <span className="font-mono text-[10px] text-muted-foreground">
            {RARITY_LABELS[stats.rarity]}
          </span>
        </div>
      )}
    </div>
  )
}

interface WarriorListProps {
  tokenIds: number[]
  loading: boolean
  error: string | null
  selectedTokenId: number | null
  onSelectToken: (tokenId: number) => void
  title?: string
  refreshKey?: number
}

export function WarriorList({ tokenIds, loading, error, selectedTokenId, onSelectToken, title, refreshKey }: WarriorListProps) {

  if (loading) {
    return (
      <Card variant="week3">
        <CardContent className="p-6">
          <h3 className="font-display text-xl mb-4">{title || "Warriors"}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card variant="week3">
        <CardContent className="p-6">
          <h3 className="font-display text-xl mb-4">{title || "Warriors"}</h3>
          <div className="text-center py-8">
            <p className="font-mono text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tokenIds.length === 0) {
    return (
      <Card variant="week3">
        <CardContent className="p-6">
          <h3 className="font-display text-xl mb-4">{title || "Warriors"}</h3>
          <div className="text-center py-12">
            <Swords className="h-12 w-12 text-week3/30 mx-auto mb-4" />
            <p className="font-mono text-sm text-muted-foreground">
              NO WARRIORS FOUND
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Mint your first warrior to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="week3">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">{title || "Warriors"}</h3>
          <Badge variant="week3">{tokenIds.length} OWNED</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tokenIds.map((tokenId) => (
            <WarriorCard
              key={`${tokenId}-${refreshKey || 0}`}
              tokenId={tokenId}
              isSelected={selectedTokenId === tokenId}
              onClick={() => onSelectToken(tokenId)}
              refreshKey={refreshKey}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
