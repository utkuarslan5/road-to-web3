"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface SearchFormProps {
  onSearch: (walletAddress: string, collectionAddress: string) => void
  loading?: boolean
}

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [walletAddress, setWalletAddress] = useState("")
  const [collectionAddress, setCollectionAddress] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const wallet = walletAddress.trim()
    const collection = collectionAddress.trim()

    if (wallet || collection) {
      onSearch(wallet, collection)
    }
  }

  return (
    <Card variant="week4">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="week4">SEARCH NFTs</Badge>
          <Badge variant="outline">Ethereum</Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="wallet-address" className="font-mono text-xs tracking-wider uppercase">
              Wallet Address
            </Label>
            <Input
              id="wallet-address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono border-week4/30 focus-visible:border-week4 focus-visible:ring-week4/20"
            />
            <p className="font-mono text-xs text-muted-foreground">
              Filter by wallet owner (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection-address" className="font-mono text-xs tracking-wider uppercase">
              Collection Address
            </Label>
            <Input
              id="collection-address"
              value={collectionAddress}
              onChange={(e) => setCollectionAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono border-week4/30 focus-visible:border-week4 focus-visible:ring-week4/20"
            />
            <p className="font-mono text-xs text-muted-foreground">
              Filter by collection (optional)
            </p>
          </div>

          <div className="bg-screen border border-week4/20 p-3 rounded-lg">
            <p className="font-mono text-xs text-muted-foreground">
              <span className="text-week4">TIP:</span> Fill one or both fields to search
            </p>
          </div>

          <Button
            type="submit"
            variant="week4"
            disabled={loading || (!walletAddress.trim() && !collectionAddress.trim())}
            className="w-full"
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? "SEARCHING..." : "SEARCH NFTs"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
