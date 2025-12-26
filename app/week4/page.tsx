"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { SearchForm } from "@/components/week4/SearchForm"
import { NFTGrid } from "@/components/week4/NFTGrid"
import { AlchemyService, type NFT } from "@/lib/alchemy"
import { extractErrorMessage } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const DEFAULT_COLLECTION = "0xbd3531da5cf5857e7cfaa92426877b022e612cf8"

export default function Week4Page() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [alchemy] = useState(() => new AlchemyService())
  const { toast } = useToast()

  // Load default collection on mount
  useEffect(() => {
    const loadDefaultCollection = async () => {
      setLoading(true)
      setNfts([])

      try {
        const result = await alchemy.getNFTsByCollection(DEFAULT_COLLECTION)
        setNfts(result.nfts || [])
        if (result.nfts.length === 0) {
          toast({
            title: "No NFTs found",
            description: "No NFTs found for this collection",
          })
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: extractErrorMessage(error),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDefaultCollection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = async (walletAddress: string, collectionAddress: string) => {
    setLoading(true)
    setNfts([])

    try {
      let allNfts: NFT[] = []

      // If both wallet and collection are specified, fetch from wallet and filter by collection
      if (walletAddress && collectionAddress) {
        const result = await alchemy.getNFTsByWallet(walletAddress)
        allNfts = (result.ownedNfts || []).filter(
          (nft) => nft.contract.address.toLowerCase() === collectionAddress.toLowerCase()
        )
      }
      // If only wallet is specified, fetch from wallet
      else if (walletAddress) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:66',message:'Fetching NFTs by wallet',data:{walletAddress},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const result = await alchemy.getNFTsByWallet(walletAddress)
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/a8e5cd40-aac2-4a1d-b476-7bb73bdb3272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:68',message:'Wallet API result received',data:{ownedNftsCount:result.ownedNfts?.length||0,hasOwnedNfts:!!result.ownedNfts,firstNftSample:result.ownedNfts?.[0]?{name:result.ownedNfts[0].name,title:result.ownedNfts[0].title,hasRaw:!!result.ownedNfts[0].raw}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        allNfts = result.ownedNfts || []
      }
      // If only collection is specified, fetch from collection
      else if (collectionAddress) {
        const result = await alchemy.getNFTsByCollection(collectionAddress)
        allNfts = result.nfts || []
      }
      // If neither is specified, use default collection
      else {
        const result = await alchemy.getNFTsByCollection(DEFAULT_COLLECTION)
        allNfts = result.nfts || []
      }

      setNfts(allNfts)
      if (allNfts.length === 0) {
        toast({
          title: "No NFTs found",
          description: walletAddress && collectionAddress
            ? `No NFTs found in collection ${collectionAddress} owned by ${walletAddress}`
            : walletAddress
            ? `No NFTs found for wallet ${walletAddress}`
            : collectionAddress
            ? `No NFTs found for collection ${collectionAddress}`
            : "No NFTs found",
        })
      }
    } catch (error: any) {
      console.error("Error fetching NFTs:", error)
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="mb-8">
          <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-sm font-semibold mb-4">
            Week 4 ✨ New
          </span>
          <h1 className="text-4xl font-bold mb-3">NFT Gallery</h1>
          <p className="text-muted-foreground">
            Browse NFTs from Ethereum mainnet using Alchemy API - Search by wallet or collection address
          </p>
        </div>

        <div className="mb-8">
          <SearchForm onSearch={handleSearch} loading={loading} />
        </div>

        <NFTGrid nfts={nfts} alchemy={alchemy} loading={loading} />
      </main>
      <Footer />
    </div>
  )
}

