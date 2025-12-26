"use client"

import { Card, CardContent } from "@/components/ui/card"
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
      <Card variant="week1" className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="week1">LIVE NFT</Badge>
            <Badge variant="outline">Sepolia</Badge>
          </div>
          <Skeleton className="w-full aspect-square rounded-lg mb-4" />
          <Skeleton className="h-7 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card variant="week1" className="overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center text-destructive py-8">
            <p className="font-mono text-sm">ERROR: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="week1" className="overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="week1">LIVE NFT</Badge>
          <Badge variant="outline">Sepolia</Badge>
        </div>

        {imageUrl && (
          <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden border-2 border-week1/30 group-hover:border-week1/60 transition-colors">
            <Image
              src={imageUrl}
              alt={metadata?.name || "NFT"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            {/* Scanline overlay on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity scanlines pointer-events-none" />
          </div>
        )}

        <h3 className="font-display text-2xl mb-2 text-week1">
          {metadata?.name || "Loading..."}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {metadata?.description || ""}
        </p>
      </CardContent>
    </Card>
  )
}
