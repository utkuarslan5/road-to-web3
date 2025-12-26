"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { WEEK3_CONFIG, CHAIN_BATTLES_ABI, RARITY_LABELS } from "@/lib/contracts"
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

export function WarriorStats({ tokenId }: { tokenId: number | null }) {
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
        
        // Try latest contract first, then fallback to old contract
        let contract = getContract(WEEK3_CONFIG.contractAddress, CHAIN_BATTLES_ABI, provider)
        let contractAddress = WEEK3_CONFIG.contractAddress
        
        // Try to fetch from latest contract first
        try {
          await contract.ownerOf(tokenId)
        } catch (ownerErr: any) {
          // If latest contract fails, try old contract
          try {
            contract = getContract(WEEK3_CONFIG.oldContractAddress, CHAIN_BATTLES_ABI, provider)
            contractAddress = WEEK3_CONFIG.oldContractAddress
            await contract.ownerOf(tokenId)
          } catch (oldOwnerErr: any) {
            throw new Error(`Token ID ${tokenId} does not exist in current or old contract. Mint a warrior first!`)
          }
        }
        
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
      } catch (err: any) {
        // Provide user-friendly error messages
        if (err.message?.includes("does not exist")) {
          setError(err.message)
        } else if (err.message?.includes("execution reverted") || err.message?.includes("require")) {
          setError(`Token ID ${tokenId} does not exist. Mint a warrior first!`)
        } else {
          setError(err.message || "Failed to load stats")
        }
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [tokenId])

  if (loading) {
    return (
      <Card className="glass p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </Card>
    )
  }

  if (error || !stats) {
    return (
      <Card className="glass p-6">
        <h3 className="text-xl font-bold mb-4">Stats</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {error || "No stats available. Select or mint a warrior to view stats."}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass p-6">
      <h3 className="text-xl font-bold mb-4">Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Level</div>
          <div className="text-2xl font-bold">{stats.level}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Rarity</div>
          <div className="text-2xl font-bold">{RARITY_LABELS[stats.rarity]}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Power</div>
          <div className="text-2xl font-bold">{stats.power}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Agility</div>
          <div className="text-2xl font-bold">{stats.agility}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Vitality</div>
          <div className="text-2xl font-bold">{stats.vitality}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">W / L</div>
          <div className="text-2xl font-bold">
            {stats.victories} / {stats.defeats}
          </div>
        </div>
      </div>
    </Card>
  )
}

