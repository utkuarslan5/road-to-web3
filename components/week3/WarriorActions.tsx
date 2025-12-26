"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/hooks/useWallet"
import { useContract } from "@/hooks/useContract"
import { WEEK3_CONFIG, CHAIN_BATTLES_ABI } from "@/lib/contracts"
import { POLYGON_AMOY } from "@/config/chains"
import { extractErrorMessage } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Plus, TrendingUp, Sword } from "lucide-react"

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
      // Call success callback to refresh NFT list
      if (onMintSuccess) {
        await onMintSuccess()
      }
    } catch (error: any) {
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
        description: "Your warrior's stats have increased 💪",
      })
      // Call success callback and refresh
      if (onTrainSuccess) {
        onTrainSuccess()
      }
      onTokenChange(currentTokenId) // Refresh
    } catch (error: any) {
      const message = extractErrorMessage(error)
      const errorString = JSON.stringify(error).toLowerCase()
      
      // Check for cooldown errors with various patterns
      const cooldownPatterns = [
        /cooldown/i,
        /CooldownActive/i,
        /wait.*before/i,
        /not ready/i,
      ]
      
      const isCooldownError = cooldownPatterns.some(pattern => 
        pattern.test(message) || pattern.test(errorString)
      )
      
      // Check for insufficient funds errors
      const insufficientFundsPatterns = [
        /insufficient funds/i,
        /insufficient balance/i,
        /not enough funds/i,
        /balance too low/i,
      ]
      
      const isInsufficientFunds = insufficientFundsPatterns.some(pattern =>
        pattern.test(message) || pattern.test(errorString)
      )
      
      // Check for JSON-RPC/internal errors
      const isRpcError = 
        message.includes("JSON-RPC") ||
        message.includes("Internal JSON-RPC") ||
        message.includes("-32603") ||
        errorString.includes("json-rpc") ||
        errorString.includes("internal error") ||
        errorString.includes("could not coalesce")
      
      if (isCooldownError) {
        // Try to get remaining time from stats
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
              const timeStr = minutes > 0 
                ? `${minutes}m ${seconds}s` 
                : `${seconds}s`
              
              toast({
                title: "⏱️ Training Cooldown",
                description: `Please wait ${timeStr} before training again. Your warrior needs rest!`,
                variant: "default",
              })
            } else {
              toast({
                title: "⏱️ Training Cooldown",
                description: "Please wait a moment before training again. Your warrior needs rest!",
                variant: "default",
              })
            }
          } else {
            toast({
              title: "⏱️ Training Cooldown",
              description: "Please wait 60 seconds before training again. Your warrior needs rest!",
              variant: "default",
            })
          }
        } catch {
          // Fallback if we can't get stats
          toast({
            title: "⏱️ Training Cooldown",
            description: "Please wait 60 seconds before training again. Your warrior needs rest!",
            variant: "default",
          })
        }
      } else if (isInsufficientFunds) {
        toast({
          title: "💰 Insufficient Funds",
          description: "You don't have enough MATIC to pay for gas. Please add more funds to your wallet.",
          variant: "destructive",
        })
      } else if (isRpcError) {
        toast({
          title: "⚠️ Network Error",
          description: "There was a problem connecting to the network. Please check your connection and try again in a moment.",
          variant: "destructive",
        })
      } else {
        // Generic error - try to make it more user-friendly
        let friendlyMessage = message
        
        // Remove technical details
        if (message.includes("execution reverted")) {
          friendlyMessage = "Transaction was rejected. Please check if you own this warrior and try again."
        } else if (message.includes("user rejected") || message.includes("User denied")) {
          friendlyMessage = "Transaction was cancelled. Please try again when ready."
        } else if (message.length > 100) {
          // If message is too long/technical, provide a generic one
          friendlyMessage = "Something went wrong. Please try again or check your wallet connection."
        }
        
        toast({
          title: "Error",
          description: friendlyMessage,
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
    <Card className="glass p-6">
      <h3 className="text-xl font-bold mb-4">Actions</h3>

      <div className="space-y-4">
        {!wallet.isConnected ? (
          <Button
            onClick={() => wallet.connect()}
            disabled={wallet.isConnecting}
            className="w-full"
          >
            {wallet.isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        ) : (
          <>
            <div>
              <Button
                onClick={handleMint}
                disabled={minting}
                className="w-full"
                variant="secondary"
              >
                <Plus className="mr-2 h-4 w-4" />
                {minting ? "Minting..." : "Mint Warrior"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Mint your first Chain Battles warrior
              </p>
            </div>

            <div>
              <Button
                onClick={handleTrain}
                disabled={training || !currentTokenId}
                className="w-full"
                variant="secondary"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                {training ? "Training..." : "Train Warrior"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Increase your warrior's stats (60s cooldown)
              </p>
            </div>

            <div>
              <Label htmlFor="token-input">View Token ID</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="token-input"
                  type="number"
                  placeholder="Enter token ID"
                  min="1"
                  value={viewTokenId}
                  onChange={(e) => setViewTokenId(e.target.value)}
                />
                <Button onClick={handleView} variant="outline">
                  View
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                View any minted warrior
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}

