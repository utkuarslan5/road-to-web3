"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useContract } from "@/hooks/useContract"
import { WEEK2_CONFIG, COFFEE_ABI } from "@/lib/contracts"
import { getProvider, getContract } from "@/lib/ethers"
import { ethers } from "ethers"
import { formatDistanceToNow } from "date-fns"
import { RefreshCw } from "lucide-react"

interface Memo {
  supporter: string
  timestamp: bigint
  name: string
  message: string
}

export function MemoBoard() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const wallet = {
    address: null,
    provider: null,
    signer: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  }
  const { call } = useContract(WEEK2_CONFIG.contractAddress, COFFEE_ABI, wallet)

  const fetchMemos = async () => {
    try {
      setLoading(true)
      setError(null)

      const provider = getProvider() || new ethers.JsonRpcProvider(WEEK2_CONFIG.rpcUrl)
      const contract = getContract(WEEK2_CONFIG.contractAddress, COFFEE_ABI, provider)
      
      let memosData: Memo[] = []
      try {
        memosData = await contract.memos() as Memo[]
      } catch (callErr: any) {
        // If error is "could not decode result data" with value="0x", treat as empty array
        // This happens when the contract returns empty data (no memos yet)
        if (callErr.code === 'BAD_DATA' && (callErr.value === '0x' || callErr.info?.method === 'memos')) {
          memosData = []
        } else {
          // Re-throw other errors
          throw callErr
        }
      }

      setMemos(memosData)
    } catch (err: any) {
      setError(err.message || "Failed to fetch memos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemos()
  }, [])

  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold">MEMO BOARD</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchMemos}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : error ? (
          <p className="text-destructive text-center">{error}</p>
        ) : memos.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No memos yet. Be the first to send a coffee!
          </p>
        ) : (
          [...memos]
            .reverse()
            .map((memo, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{memo.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(Number(memo.timestamp) * 1000, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{memo.message}</p>
              </div>
            ))
        )}
      </div>
    </Card>
  )
}

