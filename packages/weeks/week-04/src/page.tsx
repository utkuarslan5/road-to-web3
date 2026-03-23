"use client"

import { useState, useEffect } from "react"
import {
  AlchemyService,
  extractErrorMessage,
  NFTGrid,
  PaginationControls,
  SearchForm,
  useToast,
  type NFT,
} from "@road/shared"

const DEFAULT_COLLECTION = "0xbd3531da5cf5857e7cfaa92426877b022e612cf8"
const PAGE_SIZE = 20

export default function Week04Page() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [alchemy] = useState(() => new AlchemyService())
  const { toast } = useToast()

  const [nextToken, setNextToken] = useState<string | undefined>(undefined)
  const [pageKey, setPageKey] = useState<string | undefined>(undefined)
  const [startTokenHistory, setStartTokenHistory] = useState<string[]>([])
  const [pageKeyHistory, setPageKeyHistory] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isPaginationEnabled, setIsPaginationEnabled] = useState(false)
  const [currentCollectionAddress, setCurrentCollectionAddress] = useState<string | undefined>(undefined)
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string | undefined>(undefined)
  const [paginationMode, setPaginationMode] = useState<"collection" | "wallet" | null>(null)

  useEffect(() => {
    const loadDefaultCollection = async () => {
      setLoading(true)
      setNfts([])

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
        setNfts(result.nfts || [])
        const normalizedToken = result.nextToken && result.nextToken.trim() !== "" ? result.nextToken : undefined
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
  }, [alchemy, toast])

  const handleSearch = async (walletAddress: string, collectionAddress: string) => {
    setLoading(true)
    setNfts([])

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

      if (walletAddress && collectionAddress) {
        setIsPaginationEnabled(true)
        setCurrentWalletAddress(walletAddress)
        setCurrentCollectionAddress(collectionAddress)
        setPaginationMode("wallet")
        const result = await alchemy.getNFTsByWallet(walletAddress, PAGE_SIZE)
        allNfts = (result.ownedNfts || []).filter(
          nft => nft.contract.address.toLowerCase() === collectionAddress.toLowerCase()
        )
        const normalizedPageKey = result.pageKey && result.pageKey.trim() !== "" ? result.pageKey : undefined
        setPageKey(normalizedPageKey)
      } else if (walletAddress) {
        setIsPaginationEnabled(true)
        setCurrentWalletAddress(walletAddress)
        setPaginationMode("wallet")
        const result = await alchemy.getNFTsByWallet(walletAddress, PAGE_SIZE)
        allNfts = result.ownedNfts || []
        const normalizedPageKey = result.pageKey && result.pageKey.trim() !== "" ? result.pageKey : undefined
        setPageKey(normalizedPageKey)
      } else if (collectionAddress) {
        setIsPaginationEnabled(true)
        setCurrentCollectionAddress(collectionAddress)
        setPaginationMode("collection")
        const result = await alchemy.getNFTsByCollection(collectionAddress, PAGE_SIZE)
        allNfts = result.nfts || []
        setNextToken(result.nextToken && result.nextToken.trim() !== "" ? result.nextToken : undefined)
      } else {
        setIsPaginationEnabled(true)
        setCurrentCollectionAddress(DEFAULT_COLLECTION)
        setPaginationMode("collection")
        const result = await alchemy.getNFTsByCollection(DEFAULT_COLLECTION, PAGE_SIZE)
        allNfts = result.nfts || []
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
        if (!pageKey) return

        const pageKeyToUse = pageKey

        const result = await alchemy.getNFTsByWallet(currentWalletAddress, PAGE_SIZE, pageKeyToUse)

        let allNfts = result.ownedNfts || []

        if (currentCollectionAddress) {
          allNfts = allNfts.filter(
            nft => nft.contract.address.toLowerCase() === currentCollectionAddress.toLowerCase()
          )
        }

        setNfts(allNfts)
        const normalizedPageKey = result.pageKey && result.pageKey.trim() !== "" ? result.pageKey : undefined
        setPageKey(normalizedPageKey)
        setPageKeyHistory(prev => [...prev, pageKeyToUse])
        setCurrentPage(prev => prev + 1)
      } else if (paginationMode === "collection" && currentCollectionAddress) {
        if (!nextToken) return

        const tokenToUse = nextToken

        const result = await alchemy.getNFTsByCollection(currentCollectionAddress, PAGE_SIZE, tokenToUse)

        setNfts(result.nfts || [])
        const normalizedToken = result.nextToken && result.nextToken.trim() !== "" ? result.nextToken : undefined
        setNextToken(normalizedToken)
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
        const newHistory = pageKeyHistory.slice(0, -1)
        const previousPageKey = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined

        const result = await alchemy.getNFTsByWallet(currentWalletAddress, PAGE_SIZE, previousPageKey)

        let allNfts = result.ownedNfts || []

        if (currentCollectionAddress) {
          allNfts = allNfts.filter(
            nft => nft.contract.address.toLowerCase() === currentCollectionAddress.toLowerCase()
          )
        }

        setNfts(allNfts)
        setPageKey(result.pageKey && result.pageKey.trim() !== "" ? result.pageKey : undefined)
        setPageKeyHistory(newHistory)
        setCurrentPage(prev => prev - 1)
      } else if (paginationMode === "collection" && currentCollectionAddress) {
        const newHistory = startTokenHistory.slice(0, -1)
        const previousStartToken = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined

        const result = await alchemy.getNFTsByCollection(currentCollectionAddress, PAGE_SIZE, previousStartToken)

        setNfts(result.nfts || [])
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
    <div>
      <div className="mb-8">
        <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-sm font-semibold mb-4">
          Week 4
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
    </div>
  )
}
