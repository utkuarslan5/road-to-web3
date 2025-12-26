"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { WEEK3_CONFIG, CHAIN_BATTLES_ABI } from "@/lib/config/contracts"
import { getProvider, getContract } from "@/lib/ethers"
import { extractErrorMessage, isContractRevertError } from "@/lib/errors"
import { ethers } from "ethers"
import { Swords } from "lucide-react"

export function WarriorDisplay({ tokenId, refreshKey }: { tokenId: number | null; refreshKey?: number }) {
  const [svgData, setSvgData] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenId) {
      setLoading(false)
      return
    }

    async function fetchWarrior() {
      try {
        setLoading(true)
        setError(null)

        const provider = getProvider() || new ethers.JsonRpcProvider(WEEK3_CONFIG.rpcUrl)
        const contract = getContract(WEEK3_CONFIG.contractAddress, CHAIN_BATTLES_ABI, provider)

        const tokenURI = await contract.tokenURI(tokenId)

        if (tokenURI.startsWith("data:image/svg+xml;utf8,")) {
          setSvgData(decodeURIComponent(tokenURI.split(",")[1]))
        } else if (tokenURI.startsWith("data:image/svg+xml;base64,")) {
          setSvgData(atob(tokenURI.split(",")[1]))
        } else if (tokenURI.startsWith("data:application/json;base64,")) {
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
        } else {
          const response = await fetch(tokenURI, { cache: "no-store" })
          const json = await response.json()
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
      } catch (err: unknown) {
        if (isContractRevertError(err)) {
          setError(`Token ID ${tokenId} does not exist. Mint a warrior first!`)
        } else {
          setError(extractErrorMessage(err))
        }
        setSvgData("")
      } finally {
        setLoading(false)
      }
    }

    fetchWarrior()
  }, [tokenId, refreshKey])

  if (loading) {
    return (
      <Card variant="week3">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="week3">YOUR WARRIOR</Badge>
            <Badge variant="outline">Polygon Amoy</Badge>
          </div>
          <Skeleton className="w-full aspect-square rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card variant="week3">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Swords className="h-12 w-12 text-week3/50 mx-auto mb-4" />
            <p className="font-mono text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!tokenId || !svgData) {
    return (
      <Card variant="week3">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="week3">YOUR WARRIOR</Badge>
            <Badge variant="outline">Polygon Amoy</Badge>
          </div>
          <div className="aspect-square flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-week3/30 rounded-lg">
            <Swords className="h-16 w-16 text-week3/30 mb-4" />
            <p className="font-mono text-sm">SELECT A WARRIOR</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="week3" className="group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="week3">WARRIOR #{tokenId}</Badge>
          <Badge variant="outline">Polygon Amoy</Badge>
        </div>
        <div
          className="w-full aspect-square rounded-lg overflow-hidden bg-screen border-2 border-week3/30 group-hover:border-week3/60 transition-all group-hover:shadow-glow-week3"
          dangerouslySetInnerHTML={{ __html: svgData }}
        />
      </CardContent>
    </Card>
  )
}
