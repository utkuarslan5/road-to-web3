"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    
    // At least one field must be filled
    if (wallet || collection) {
      onSearch(wallet, collection)
    }
  }

  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold">SEARCH NFTs</span>
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
          Ethereum Mainnet
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="wallet-address">Wallet Address (Optional)</Label>
          <Input
            id="wallet-address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x... (leave empty to search all wallets)"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Filter NFTs by wallet owner (optional)
          </p>
        </div>

        <div>
          <Label htmlFor="collection-address">Collection Address (Optional)</Label>
          <Input
            id="collection-address"
            value={collectionAddress}
            onChange={(e) => setCollectionAddress(e.target.value)}
            placeholder="0x... (leave empty to search all collections)"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Filter NFTs by collection contract (optional)
          </p>
        </div>

        <div className="text-xs text-muted-foreground bg-white/5 p-3 rounded-lg">
          <p className="font-semibold mb-1">💡 Tip:</p>
          <p>Leave both empty to see default collection, or fill one/both to filter results</p>
        </div>

        <Button type="submit" disabled={loading || (!walletAddress.trim() && !collectionAddress.trim())} className="w-full">
          <Search className="mr-2 h-4 w-4" />
          {loading ? "Searching..." : "Search NFTs"}
        </Button>
      </form>
    </Card>
  )
}

