"use client"

import { Card } from "@/components/ui/card"
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
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NFTCard.tsx:15',message:'NFTCard render entry',data:{contractAddress:nft.contract.address,tokenId:nft.tokenId,hasName:!!nft.name,hasTitle:!!nft.title,hasRawMetadata:!!nft.raw?.metadata,hasMetadata:!!nft.metadata},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  const imageUrl = alchemy.getImageUrl(nft)
  const name = alchemy.getNFTName(nft)
  const description = alchemy.getNFTDescription(nft)
  const collectionName = nft.contract.name || "Unknown Collection"
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'NFTCard.tsx:21',message:'NFTCard extracted values',data:{imageUrl,name,description,collectionName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion


  return (
    <Card className="glass overflow-hidden hover:border-accent-purple/50 transition-colors">
      <div className="relative aspect-square w-full bg-white/5 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement
              const currentSrc = target.src
              
              // Try alternative IPFS gateways on error
              if (currentSrc.includes("cloudflare-ipfs.com")) {
                const cidMatch = currentSrc.match(/\/ipfs\/([^/?]+)/)
                if (cidMatch && cidMatch[1]) {
                  target.src = `https://ipfs.io/ipfs/${cidMatch[1]}`
                  return
                }
              }
              
              // Try nftstorage.link if cloudflare or ipfs.io failed
              if (currentSrc.includes("/ipfs/")) {
                const cidMatch = currentSrc.match(/\/ipfs\/([^/?]+)/)
                if (cidMatch && cidMatch[1]) {
                  target.src = `https://nftstorage.link/ipfs/${cidMatch[1]}`
                  return
                }
              }
              
              // Try gateway.pinata.cloud as last resort
              if (currentSrc.includes("/ipfs/")) {
                const cidMatch = currentSrc.match(/\/ipfs\/([^/?]+)/)
                if (cidMatch && cidMatch[1]) {
                  target.src = `https://gateway.pinata.cloud/ipfs/${cidMatch[1]}`
                  return
                }
              }
              
              // Final fallback to placeholder
              target.onerror = null // Prevent infinite loop
              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23111' width='400' height='400'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-sm mb-1">No Image URL</p>
              <p className="text-xs opacity-50">Check console for details</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1">{name}</h3>
          <Link
            href={`https://etherscan.io/nft/${nft.contract.address}/${nft.tokenId}`}
            target="_blank"
            rel="noreferrer"
            className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {description || "No description"}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {collectionName}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            #{nft.tokenId}
          </span>
        </div>
      </div>
    </Card>
  )
}

export function NFTCardSkeleton() {
  return (
    <Card className="glass overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </Card>
  )
}

