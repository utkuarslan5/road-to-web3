"use client"

import { NFTCard, NFTCardSkeleton } from "./NFTCard"
import { AlchemyService, type NFT } from "@/lib/alchemy"
import { Image } from "lucide-react"

interface NFTGridProps {
  nfts: NFT[]
  alchemy: AlchemyService
  loading?: boolean
}

export function NFTGrid({ nfts, alchemy, loading }: NFTGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <NFTCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-16">
        <Image className="h-16 w-16 text-week4/30 mx-auto mb-4" />
        <p className="font-mono text-lg text-muted-foreground mb-2">NO NFTs FOUND</p>
        <p className="text-sm text-muted-foreground/60">
          Try searching with a different address
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts.map((nft, index) => (
        <NFTCard key={`${nft.contract.address}-${nft.tokenId}-${index}`} nft={nft} alchemy={alchemy} />
      ))}
    </div>
  )
}
