"use client"

import { NFTCard, NFTCardSkeleton } from "./NFTCard"
import { AlchemyService, type NFT } from "@/lib/alchemy"

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
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-2">No NFTs found</p>
        <p className="text-sm text-muted-foreground">
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

