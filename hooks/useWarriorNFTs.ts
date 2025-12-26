"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { getProvider, getContract } from "@/lib/ethers"
import { WEEK3_CONFIG, CHAIN_BATTLES_ABI } from "@/lib/contracts"

export function useWarriorNFTs(ownerAddress: string | null) {
  const [tokenIds, setTokenIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNFTs = useCallback(async () => {
    if (!ownerAddress) {
      setTokenIds([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const provider = getProvider() || new ethers.JsonRpcProvider(WEEK3_CONFIG.rpcUrl)
      const contract = getContract(WEEK3_CONFIG.contractAddress, CHAIN_BATTLES_ABI, provider)

      // Get balance first
      const balance = await contract.balanceOf(ownerAddress)
      const balanceNum = Number(balance)

      if (balanceNum === 0) {
        setTokenIds([])
        setLoading(false)
        return
      }

      // Check a reasonable range of token IDs (1-1000)
      // This is not the most efficient but works for ERC721 without enumeration
      const foundTokenIds: number[] = []
      const maxTokenId = 1000 // Reasonable upper limit
      const batchSize = 20 // Check in batches to avoid overwhelming RPC

      for (let i = 1; i <= maxTokenId && foundTokenIds.length < balanceNum; i += batchSize) {
        const batch = []
        for (let j = i; j < i + batchSize && j <= maxTokenId; j++) {
          batch.push(
            contract.ownerOf(j)
              .then((owner: string) => {
                // Check ownership in the same call
                if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
                  return j
                }
                return null
              })
              .catch(() => null)
          )
        }

        const results = await Promise.all(batch)
        for (const tokenId of results) {
          if (tokenId !== null) {
            foundTokenIds.push(tokenId)
          }
        }

        // If we found all tokens, break early
        if (foundTokenIds.length >= balanceNum) {
          break
        }
      }

      // Sort token IDs
      foundTokenIds.sort((a, b) => a - b)
      setTokenIds(foundTokenIds)
    } catch (err: any) {
      setError(err.message || "Failed to fetch NFTs")
      setTokenIds([])
    } finally {
      setLoading(false)
    }
  }, [ownerAddress])

  useEffect(() => {
    fetchNFTs()
  }, [fetchNFTs])

  return {
    tokenIds,
    loading,
    error,
    refresh: fetchNFTs,
  }
}

