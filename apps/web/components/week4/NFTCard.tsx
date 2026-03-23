"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlchemyService, type NFT } from "@/lib/alchemy"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface NFTCardProps {
  nft: NFT
  alchemy: AlchemyService
}

export function NFTCard({ nft, alchemy }: NFTCardProps) {
  const imageUrl = alchemy.getImageUrl(nft)
  const name = alchemy.getNFTName(nft)
  const description = alchemy.getNFTDescription(nft)
  const collectionName = nft.contract.name || "Unknown Collection"

  return (
    <Card variant="week4" className="overflow-hidden group">
      <div className="relative aspect-square w-full bg-screen overflow-hidden border-b border-week4/20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement
              const currentSrc = target.src

              if (currentSrc.includes("cloudflare-ipfs.com")) {
                const cidMatch = currentSrc.match(/\/ipfs\/([^/?]+)/)
                if (cidMatch && cidMatch[1]) {
                  target.src = `https://ipfs.io/ipfs/${cidMatch[1]}`
                  return
                }
              }

              if (currentSrc.includes("/ipfs/")) {
                const cidMatch = currentSrc.match(/\/ipfs\/([^/?]+)/)
                if (cidMatch && cidMatch[1]) {
                  target.src = `https://nftstorage.link/ipfs/${cidMatch[1]}`
                  return
                }
              }

              if (currentSrc.includes("/ipfs/")) {
                const cidMatch = currentSrc.match(/\/ipfs\/([^/?]+)/)
                if (cidMatch && cidMatch[1]) {
                  target.src = `https://gateway.pinata.cloud/ipfs/${cidMatch[1]}`
                  return
                }
              }

              target.onerror = null
              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%231b1c22' width='400' height='400'/%3E%3Ctext fill='%238a8b90' font-family='monospace' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENO IMAGE%3C/text%3E%3C/svg%3E"
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="font-mono text-sm">NO IMAGE</p>
            </div>
          </div>
        )}
        {/* Scanline overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity scanlines pointer-events-none" />
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1 group-hover:text-week4 transition-colors">
            {name}
          </h3>
          <Link
            href={`https://etherscan.io/nft/${nft.contract.address}/${nft.tokenId}`}
            target="_blank"
            rel="noreferrer"
            className="ml-2 text-muted-foreground hover:text-week4 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {description || "No description"}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="week4" className="text-[10px] max-w-[120px] truncate">
            {collectionName}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            #{nft.tokenId.length > 8 ? `${nft.tokenId.slice(0, 8)}...` : nft.tokenId}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function NFTCardSkeleton() {
  return (
    <Card variant="week4" className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex justify-between pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}
