"use client"

import { useState, useCallback, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { WarriorDisplay } from "@/components/week3/WarriorDisplay"
import { WarriorStats } from "@/components/week3/WarriorStats"
import { WarriorActions } from "@/components/week3/WarriorActions"
import { WarriorList } from "@/components/week3/WarriorList"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/useWallet"
import { POLYGON_AMOY } from "@/config/chains"
import { WEEK3_CONFIG } from "@/lib/contracts"
import { truncateAddress } from "@/lib/utils"
import Link from "next/link"
import { useWarriorNFTs } from "@/hooks/useWarriorNFTs"

export default function Week3Page() {
  const wallet = useWallet(POLYGON_AMOY)
  const [currentTokenId, setCurrentTokenId] = useState<number | null>(null)
  
  // Determine which address to use: connected wallet or deployer
  const ownerAddress = wallet.isConnected && wallet.address 
    ? wallet.address 
    : WEEK3_CONFIG.deployerAddress

  const { tokenIds, loading: nftsLoading, error: nftsError, refresh: refreshNFTs } = useWarriorNFTs(ownerAddress)

  const handleTokenSelect = useCallback((tokenId: number) => {
    setCurrentTokenId(tokenId)
  }, [])

  const handleMintSuccess = useCallback(async () => {
    // Refresh NFT list
    await refreshNFTs()
    // Wait a bit for the list to update, then select the highest token ID (newest)
    setTimeout(() => {
      // Get updated token IDs - we'll need to refetch
      refreshNFTs().then(() => {
        // After refresh, the tokenIds will update via the hook
        // We'll select the max token ID in a useEffect
      })
    }, 2000)
  }, [refreshNFTs])

  // Auto-select newest token after mint (when tokenIds update)
  useEffect(() => {
    if (tokenIds.length > 0 && wallet.isConnected) {
      // If we don't have a selection or the current selection is not in the list, select the newest
      const maxTokenId = Math.max(...tokenIds)
      if (!currentTokenId || !tokenIds.includes(currentTokenId)) {
        setCurrentTokenId(maxTokenId)
      }
    }
  }, [tokenIds, wallet.isConnected, currentTokenId])

  const handleTrainSuccess = useCallback(() => {
    // Stats will auto-refresh via useEffect in WarriorStats
    // But we can trigger a manual refresh if needed
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-sm font-semibold">
              Week 3
            </span>
            {wallet.isConnected && wallet.address && (
              <Badge variant="secondary" className="text-sm">
                Connected: {truncateAddress(wallet.address)}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-3">Chain Battles NFT</h1>
          <p className="text-muted-foreground">
            Dynamic on-chain NFTs with training, battles, and fully rendered SVG graphics
          </p>
        </div>

        {/* NFT List */}
        <div className="mb-8">
          <WarriorList
            tokenIds={tokenIds}
            loading={nftsLoading}
            error={nftsError}
            selectedTokenId={currentTokenId}
            onSelectToken={handleTokenSelect}
            title={wallet.isConnected ? "Your Warriors" : "Deployer's Warriors"}
          />
        </div>

        {/* Selected Warrior View */}
        {currentTokenId && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <WarriorDisplay tokenId={currentTokenId} />
            <div className="space-y-6">
              <WarriorStats tokenId={currentTokenId} />
              <WarriorActions
                currentTokenId={currentTokenId}
                onTokenChange={setCurrentTokenId}
                onMintSuccess={handleMintSuccess}
                onTrainSuccess={handleTrainSuccess}
              />
            </div>
          </div>
        )}

        {/* No selection message */}
        {!currentTokenId && (
          <Card className="glass p-6 mb-8">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Select a warrior from the list above to view details and train
              </p>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass p-6">
            <h3 className="text-xl font-bold mb-4">Contract Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Contract</dt>
                <dd>
                  <Link
                    href={`${WEEK3_CONFIG.explorer}/address/${WEEK3_CONFIG.contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm hover:text-accent-cyan transition-colors"
                  >
                    {truncateAddress(WEEK3_CONFIG.contractAddress)}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Network</dt>
                <dd className="text-sm">{WEEK3_CONFIG.chainName}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Features</dt>
                <dd className="text-sm">Dynamic NFTs, Training, PvP Battles</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground mb-1">Cooldown</dt>
                <dd className="text-sm">60 seconds</dd>
              </div>
            </dl>
          </Card>

          <Card className="glass p-6">
            <h3 className="text-xl font-bold mb-4">Features</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Fully on-chain SVG rendering</li>
              <li>• Dynamic stats that evolve over time</li>
              <li>• Training system with cooldowns</li>
              <li>• PvP battle mechanics</li>
              <li>• Rarity system (Common to Mythic)</li>
              <li>• Real-time stat updates</li>
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

