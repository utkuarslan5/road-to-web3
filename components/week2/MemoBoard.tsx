"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useContract } from "@/hooks/useContract"
import { WEEK2_CONFIG, COFFEE_ABI } from "@/lib/contracts"
import { getProvider, getContract } from "@/lib/ethers"
import { ethers } from "ethers"
import { formatDistanceToNow } from "date-fns"
import { RefreshCw, Coffee } from "lucide-react"

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
        if (callErr.code === 'BAD_DATA' && (callErr.value === '0x' || callErr.info?.method === 'memos')) {
          memosData = []
        } else {
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
    <Card variant="week2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="week2">MEMO BOARD</Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={fetchMemos}
            disabled={loading}
            className="hover:text-week2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
          {loading ? (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : error ? (
            <div className="text-center py-8">
              <p className="font-mono text-sm text-destructive">ERROR: {error}</p>
            </div>
          ) : memos.length === 0 ? (
            <div className="text-center py-12">
              <Coffee className="h-12 w-12 text-week2/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-mono text-sm">
                NO MEMOS YET
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Be the first to send a coffee!
              </p>
            </div>
          ) : (
            [...memos]
              .reverse()
              .map((memo, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-screen border border-week2/20 hover:border-week2/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{memo.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {formatDistanceToNow(Number(memo.timestamp) * 1000, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Coffee className="h-4 w-4 text-week2" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {memo.message}
                  </p>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
