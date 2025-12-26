"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useNFT } from "@/hooks/useNFT"
import { WEEK1_CONFIG } from "@/lib/contracts"
import Image from "next/image"

export function NFTDisplay() {
  const { metadata, imageUrl, loading, error } = useNFT(
    WEEK1_CONFIG.rpcUrl,
    WEEK1_CONFIG.contractAddress,
    WEEK1_CONFIG.tokenId
  )

  if (loading) {
    return (
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold">LIVE NFT</span>
          <Badge variant="secondary">Sepolia</Badge>
        </div>
        <Skeleton className="w-full aspect-square mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass p-6">
        <div className="text-center text-destructive">
          <p>Failed to load NFT: {error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold">LIVE NFT</span>
        <Badge variant="secondary">Sepolia</Badge>
      </div>
      {imageUrl && (
        <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={metadata?.name || "NFT"}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <h3 className="text-xl font-bold mb-2">{metadata?.name || "Loading..."}</h3>
      <p className="text-sm text-muted-foreground">{metadata?.description || ""}</p>
    </Card>
  )
}

