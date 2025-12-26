"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/useWallet"
import { useContract } from "@/hooks/useContract"
import { WEEK3_CONFIG, CHAIN_BATTLES_ABI } from "@/lib/config/contracts"
import { POLYGON_AMOY } from "@/lib/config/chains"
import { extractErrorMessage } from "@/lib/errors"
import { useToast } from "@/hooks/use-toast"
import { Plus, TrendingUp, Eye } from "lucide-react"

export function WarriorActions({
  currentTokenId,
  onTokenChange,
  onMintSuccess,
  onTrainSuccess,
}: {
  currentTokenId: number | null
  onTokenChange: (tokenId: number | null) => void
  onMintSuccess?: () => void | Promise<void>
  onTrainSuccess?: () => void
}) {
  const [viewTokenId, setViewTokenId] = useState("")
  const [minting, setMinting] = useState(false)
  const [training, setTraining] = useState(false)
  const { toast } = useToast()

  const wallet = useWallet(POLYGON_AMOY)
  const { sendTransaction, call } = useContract(
    WEEK3_CONFIG.contractAddress,
    CHAIN_BATTLES_ABI,
    wallet
  )

  const handleMint = async () => {
    if (!wallet.isConnected) {
      await wallet.connect()
      return
    }

    try {
      setMinting(true)
      const tx = await sendTransaction("mint")
      toast({
        title: "Transaction sent",
        description: "Minting your warrior...",
      })
      await tx.wait()
      toast({
        title: "Warrior minted!",
        description: "Your warrior has been created successfully",
      })
      if (onMintSuccess) {
        await onMintSuccess()
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setMinting(false)
    }
  }

  const handleTrain = async () => {
    if (!currentTokenId) {
      toast({
        title: "Error",
        description: "No token ID selected",
        variant: "destructive",
      })
      return
    }

    try {
      setTraining(true)
      const tx = await sendTransaction("train", currentTokenId)
      toast({
        title: "Training...",
        description: "Waiting for confirmation...",
      })
      await tx.wait()
      toast({
        title: "Warrior trained!",
        description: "Your warrior's stats have increased!",
      })
      if (onTrainSuccess) {
        onTrainSuccess()
      }
      onTokenChange(currentTokenId)
    } catch (error: unknown) {
      const message = extractErrorMessage(error)

      if (isCooldownError(error)) {
        try {
          const stats = await call("statsOf", currentTokenId)
          if (stats && stats.lastAction) {
            const lastAction = Number(stats.lastAction)
            const cooldownEnd = lastAction + WEEK3_CONFIG.cooldownSeconds
            const now = Math.floor(Date.now() / 1000)
            const remaining = cooldownEnd - now

            if (remaining > 0) {
              const minutes = Math.floor(remaining / 60)
              const seconds = remaining % 60
              const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`

              toast({
                title: "Training Cooldown",
                description: `Wait ${timeStr} before training again`,
              })
            } else {
              toast({
                title: "Training Cooldown",
                description: "Please wait a moment before training again",
              })
            }
          }
        } catch {
          toast({
            title: "Training Cooldown",
            description: "Please wait 60 seconds before training again",
          })
        }
      } else if (isInsufficientFundsError(error)) {
        toast({
          title: "Insufficient Funds",
          description: "You need more MATIC to pay for gas",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: message.length > 100 ? "Something went wrong. Please try again." : message,
          variant: "destructive",
        })
      }
    } finally {
      setTraining(false)
    }
  }

  const handleView = () => {
    const tokenId = parseInt(viewTokenId)
    if (isNaN(tokenId) || tokenId < 1) {
      toast({
        title: "Invalid token ID",
        description: "Please enter a valid token ID",
        variant: "destructive",
      })
      return
    }
    onTokenChange(tokenId)
  }

  return (
    <Card variant="week3">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl">Actions</h3>
          <Badge variant="week3">GAME</Badge>
        </div>

        <div className="space-y-4">
          {!wallet.isConnected ? (
            <Button
              variant="week3"
              onClick={() => wallet.connect()}
              disabled={wallet.isConnecting}
              className="w-full"
            >
              {wallet.isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
            </Button>
          ) : (
            <>
              <div>
                <Button
                  onClick={handleMint}
                  disabled={minting}
                  variant="outline"
                  className="w-full border-week3/50 hover:border-week3 hover:bg-week3/10 hover:text-week3"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {minting ? "MINTING..." : "MINT WARRIOR"}
                </Button>
                <p className="font-mono text-xs text-muted-foreground mt-2">
                  Create a new Chain Battles warrior
                </p>
              </div>

              <div>
                <Button
                  onClick={handleTrain}
                  disabled={training || !currentTokenId}
                  variant="week3"
                  className="w-full"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {training ? "TRAINING..." : "TRAIN WARRIOR"}
                </Button>
                <p className="font-mono text-xs text-muted-foreground mt-2">
                  Increase stats (60s cooldown)
                </p>
              </div>

              <div className="pt-2 border-t border-border">
                <Label htmlFor="token-input" className="font-mono text-xs tracking-wider uppercase">
                  View Token
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="token-input"
                    type="number"
                    placeholder="#"
                    min="1"
                    value={viewTokenId}
                    onChange={(e) => setViewTokenId(e.target.value)}
                    className="font-mono border-week3/30 focus-visible:border-week3"
                  />
                  <Button
                    onClick={handleView}
                    variant="outline"
                    className="border-week3/50 hover:border-week3"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
