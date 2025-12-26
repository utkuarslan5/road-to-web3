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
      // Use JsonRpcProvider directly for read-only calls to avoid MetaMask rate limits
      const provider = new ethers.JsonRpcProvider(WEEK3_CONFIG.rpcUrl)
      const contract = getContract(WEEK3_CONFIG.contractAddress, CHAIN_BATTLES_ABI, provider)
      
      // Check if contract has code
      const code = await provider.getCode(WEEK3_CONFIG.contractAddress)
      
      if (code === '0x' || code.length <= 2) {
        throw new Error('Contract has no code')
      }
      
      // Get balance using raw RPC call to handle edge cases
      const iface = new ethers.Interface(CHAIN_BATTLES_ABI)
      const callData = iface.encodeFunctionData("balanceOf", [ownerAddress])
      
      const rawResult = await provider.call({
        to: WEEK3_CONFIG.contractAddress,
        data: callData
      })
      
      if (!rawResult || rawResult === '0x' || rawResult.length <= 2) {
        setTokenIds([])
        setLoading(false)
        return
      }
      
      const balance = iface.decodeFunctionResult("balanceOf", rawResult)[0]
      const balanceNum = Number(balance)

      if (balanceNum === 0) {
        setTokenIds([])
        setLoading(false)
        return
      }

      // Check a reasonable range of token IDs (1-200) with rate limiting
      // This is not the most efficient but works for ERC721 without enumeration
      const foundTokenIds: number[] = []
      const maxTokenId = 200 // Reduced limit to avoid overwhelming RPC
      const batchSize = 10 // Smaller batches with delays
      const delayBetweenBatches = 100 // ms delay between batches

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
        
        // Add delay between batches to avoid rate limiting
        if (i + batchSize <= maxTokenId && foundTokenIds.length < balanceNum) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
        }
      }

      // Sort token IDs
      foundTokenIds.sort((a, b) => a - b)
      setTokenIds(foundTokenIds)
      setLoading(false)
      
    } catch (err: any) {
      setError(err.message || "Failed to fetch NFTs")
      setTokenIds([])
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
