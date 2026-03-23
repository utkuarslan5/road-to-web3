"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { WEEK3_CONFIG, CHAIN_BATTLES_ABI, RARITY_LABELS } from "@/lib/config/contracts"
import { getProvider, getContract } from "@/lib/ethers"
import { extractErrorMessage, isContractRevertError } from "@/lib/errors"
import { ethers } from "ethers"
import type { WarriorStats } from "@/types/contracts"

export function WarriorStats({ tokenId, refreshKey }: { tokenId: number | null; refreshKey?: number }) {
  const [stats, setStats] = useState<WarriorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenId) {
      setLoading(false)
      return
    }

    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)

        const provider = getProvider() || new ethers.JsonRpcProvider(WEEK3_CONFIG.rpcUrl)
        const contract = getContract(WEEK3_CONFIG.contractAddress, CHAIN_BATTLES_ABI, provider)

        const statsData = await contract.statsOf(tokenId)

        setStats({
          lastAction: statsData.lastAction,
          level: Number(statsData.level),
          power: Number(statsData.power),
          agility: Number(statsData.agility),
          vitality: Number(statsData.vitality),
          victories: Number(statsData.victories),
          defeats: Number(statsData.defeats),
          rarity: Number(statsData.rarity),
        })
      } catch (err: unknown) {
        if (isContractRevertError(err)) {
          setError(`Token #${tokenId} does not exist`)
        } else {
          setError(extractErrorMessage(err))
        }
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [tokenId, refreshKey])

  if (loading) {
    return (
      <Card variant="week3">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !stats) {
    return (
      <Card variant="week3">
        <CardContent className="p-6">
          <h3 className="font-display text-xl mb-4">Stats</h3>
          <div className="text-center py-8">
            <p className="text-muted-foreground font-mono text-sm">
              {error || "SELECT A WARRIOR TO VIEW STATS"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="week3">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl">Stats</h3>
          <Badge variant="week3">{RARITY_LABELS[stats.rarity]}</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatBlock label="LEVEL" value={stats.level} highlight />
          <StatBlock label="POWER" value={stats.power} />
          <StatBlock label="AGILITY" value={stats.agility} />
          <StatBlock label="VITALITY" value={stats.vitality} />
          <StatBlock label="WINS" value={stats.victories} positive />
          <StatBlock label="LOSSES" value={stats.defeats} negative />
        </div>
      </CardContent>
    </Card>
  )
}

function StatBlock({
  label,
  value,
  highlight,
  positive,
  negative,
}: {
  label: string
  value: number
  highlight?: boolean
  positive?: boolean
  negative?: boolean
}) {
  let valueColor = "text-foreground"
  if (highlight) valueColor = "text-week3"
  if (positive) valueColor = "text-neon-green"
  if (negative) valueColor = "text-neon-red"

  return (
    <div className="bg-screen rounded-lg p-4 border border-week3/20">
      <div className="font-mono text-xs tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <div className={`font-mono text-3xl font-bold ${valueColor}`}>
        {value}
      </div>
    </div>
  )
}
