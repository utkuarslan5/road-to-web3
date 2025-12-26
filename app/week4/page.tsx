"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { SearchForm } from "@/components/week4/SearchForm"
import { NFTGrid } from "@/components/week4/NFTGrid"
import { PaginationControls } from "@/components/week4/PaginationControls"
import { AlchemyService, type NFT } from "@/lib/alchemy"
import { extractErrorMessage } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const DEFAULT_COLLECTION = "0xbd3531da5cf5857e7cfaa92426877b022e612cf8"
const PAGE_SIZE = 20

export default function Week4Page() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [alchemy] = useState(() => new AlchemyService())
  const { toast } = useToast()
  
  // Pagination state
  const [nextToken, setNextToken] = useState<string | undefined>(undefined) // For collection pagination
  const [pageKey, setPageKey] = useState<string | undefined>(undefined) // For wallet pagination
  const [startTokenHistory, setStartTokenHistory] = useState<string[]>([])
  const [pageKeyHistory, setPageKeyHistory] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isPaginationEnabled, setIsPaginationEnabled] = useState(false)
  const [currentCollectionAddress, setCurrentCollectionAddress] = useState<string | undefined>(undefined)
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string | undefined>(undefined)
  const [paginationMode, setPaginationMode] = useState<"collection" | "wallet" | null>(null)

  // Load default collection on mount
  useEffect(() => {
    const loadDefaultCollection = async () => {
      setLoading(true)
      setNfts([])
      
      // Reset pagination state
      setNextToken(undefined)
      setPageKey(undefined)
      setStartTokenHistory([])
      setPageKeyHistory([])
      setCurrentPage(1)
      setIsPaginationEnabled(true)
      setCurrentCollectionAddress(DEFAULT_COLLECTION)
      setCurrentWalletAddress(undefined)
      setPaginationMode("collection")

      try {
        const result = await alchemy.getNFTsByCollection(DEFAULT_COLLECTION, PAGE_SIZE)
        console.log("Default collection result:", { nextToken: result.nextToken, nftCount: result.nfts?.length })
        setNfts(result.nfts || [])
        // Normalize nextToken: convert empty string to undefined
        const normalizedToken = result.nextToken && result.nextToken.trim() !== "" ? result.nextToken : undefined
        console.log("Normalized nextToken:", normalizedToken)
        setNextToken(normalizedToken)
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
    
    // Reset pagination state for new search
    setNextToken(undefined)
    setPageKey(undefined)
    setStartTokenHistory([])
    setPageKeyHistory([])
    setCurrentPage(1)
    setCurrentCollectionAddress(undefined)
    setCurrentWalletAddress(undefined)
    setPaginationMode(null)

    try {
      let allNfts: NFT[] = []

      // If both wallet and collection are specified, fetch from wallet and filter by collection
      if (walletAddress && collectionAddress) {
        // For wallet+collection combo, enable pagination on wallet side
        setIsPaginationEnabled(true)
        setCurrentWalletAddress(walletAddress)
        setCurrentCollectionAddress(collectionAddress) // Store for filtering
        setPaginationMode("wallet")
        const result = await alchemy.getNFTsByWallet(walletAddress, PAGE_SIZE)
        allNfts = (result.ownedNfts || []).filter(
          (nft) => nft.contract.address.toLowerCase() === collectionAddress.toLowerCase()
        )
        // Normalize pageKey: convert empty string to undefined
        const normalizedPageKey = result.pageKey && result.pageKey.trim() !== "" ? result.pageKey : undefined
        setPageKey(normalizedPageKey)
      }
      // If only wallet is specified, fetch from wallet
      else if (walletAddress) {
        setIsPaginationEnabled(true)
        setCurrentWalletAddress(walletAddress)
        setPaginationMode("wallet")
        const result = await alchemy.getNFTsByWallet(walletAddress, PAGE_SIZE)
        allNfts = result.ownedNfts || []
        // Normalize pageKey: convert empty string to undefined
        const normalizedPageKey = result.pageKey && result.pageKey.trim() !== "" ? result.pageKey : undefined
        setPageKey(normalizedPageKey)
      }
      // If only collection is specified, fetch from collection
      else if (collectionAddress) {
        setIsPaginationEnabled(true)
        setCurrentCollectionAddress(collectionAddress)
        setPaginationMode("collection")
        const result = await alchemy.getNFTsByCollection(collectionAddress, PAGE_SIZE)
        allNfts = result.nfts || []
        // Normalize nextToken: convert empty string to undefined
        setNextToken(result.nextToken && result.nextToken.trim() !== "" ? result.nextToken : undefined)
      }
      // If neither is specified, use default collection
      else {
        setIsPaginationEnabled(true)
        setCurrentCollectionAddress(DEFAULT_COLLECTION)
        setPaginationMode("collection")
        const result = await alchemy.getNFTsByCollection(DEFAULT_COLLECTION, PAGE_SIZE)
        allNfts = result.nfts || []
        // Normalize nextToken: convert empty string to undefined
        setNextToken(result.nextToken && result.nextToken.trim() !== "" ? result.nextToken : undefined)
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

  const handleNextPage = async () => {
    if (!isPaginationEnabled) return

    setLoading(true)
    
    try {
      if (paginationMode === "wallet" && currentWalletAddress) {
        // Wallet pagination using pageKey
        if (!pageKey) return
        
        const pageKeyToUse = pageKey
        
        const result = await alchemy.getNFTsByWallet(
          currentWalletAddress,
          PAGE_SIZE,
          pageKeyToUse
        )
        
        let allNfts = result.ownedNfts || []
        
        // If we have a collection filter, apply it
        if (currentCollectionAddress) {
          allNfts = allNfts.filter(
            (nft) => nft.contract.address.toLowerCase() === currentCollectionAddress.toLowerCase()
          )
        }
        
        console.log("Next page result (wallet):", { pageKey: result.pageKey, nftCount: allNfts.length, usedPageKey: pageKeyToUse })
        setNfts(allNfts)
        // Normalize pageKey: convert empty string to undefined
        const normalizedPageKey = result.pageKey && result.pageKey.trim() !== "" ? result.pageKey : undefined
        console.log("Normalized pageKey after next page:", normalizedPageKey)
        setPageKey(normalizedPageKey)
        // Push the pageKey we just used to history for backward navigation
        setPageKeyHistory(prev => [...prev, pageKeyToUse])
        setCurrentPage(prev => prev + 1)
      } else if (paginationMode === "collection" && currentCollectionAddress) {
        // Collection pagination using nextToken
        if (!nextToken) return
        
        const tokenToUse = nextToken
        
        const result = await alchemy.getNFTsByCollection(
          currentCollectionAddress,
          PAGE_SIZE,
          tokenToUse
        )
        
        console.log("Next page result (collection):", { nextToken: result.nextToken, nftCount: result.nfts?.length, usedToken: tokenToUse })
        setNfts(result.nfts || [])
        // Normalize nextToken: convert empty string to undefined
        const normalizedToken = result.nextToken && result.nextToken.trim() !== "" ? result.nextToken : undefined
        console.log("Normalized nextToken after next page:", normalizedToken)
        setNextToken(normalizedToken)
        // Push the token we just used to history for backward navigation
        setStartTokenHistory(prev => [...prev, tokenToUse])
        setCurrentPage(prev => prev + 1)
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

  const handlePreviousPage = async () => {
    if (currentPage <= 1 || !isPaginationEnabled) return

    setLoading(true)
    
    try {
      if (paginationMode === "wallet" && currentWalletAddress) {
        // Pop the last pageKey from history
        const newHistory = pageKeyHistory.slice(0, -1)
        // The previous page's pageKey is the last pageKey in the remaining history, or undefined if going back to page 1
        const previousPageKey = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined
        
        const result = await alchemy.getNFTsByWallet(
          currentWalletAddress,
          PAGE_SIZE,
          previousPageKey
        )
        
        let allNfts = result.ownedNfts || []
        
        // If we have a collection filter, apply it
        if (currentCollectionAddress) {
          allNfts = allNfts.filter(
            (nft) => nft.contract.address.toLowerCase() === currentCollectionAddress.toLowerCase()
          )
        }
        
        setNfts(allNfts)
        // Normalize pageKey: convert empty string to undefined
        setPageKey(result.pageKey && result.pageKey.trim() !== "" ? result.pageKey : undefined)
        setPageKeyHistory(newHistory)
        setCurrentPage(prev => prev - 1)
      } else if (paginationMode === "collection" && currentCollectionAddress) {
        // Pop the last token from history
        const newHistory = startTokenHistory.slice(0, -1)
        // The previous page's startToken is the last token in the remaining history, or undefined if going back to page 1
        const previousStartToken = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined
        
        const result = await alchemy.getNFTsByCollection(
          currentCollectionAddress,
          PAGE_SIZE,
          previousStartToken
        )
        
        setNfts(result.nfts || [])
        // Normalize nextToken: convert empty string to undefined
        setNextToken(result.nextToken && result.nextToken.trim() !== "" ? result.nextToken : undefined)
        setStartTokenHistory(newHistory)
        setCurrentPage(prev => prev - 1)
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
        
        {isPaginationEnabled && (
          <PaginationControls
            currentPage={currentPage}
            hasNext={paginationMode === "wallet" ? !!pageKey : !!nextToken}
            hasPrevious={currentPage > 1}
            onNext={handleNextPage}
            onPrevious={handlePreviousPage}
            loading={loading}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}
