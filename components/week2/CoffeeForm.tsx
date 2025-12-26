"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/hooks/useWallet"
import { useContract } from "@/hooks/useContract"
import { WEEK2_CONFIG, COFFEE_ABI } from "@/lib/contracts"
import { parseEther, extractErrorMessage } from "@/lib/utils"
import { SEPOLIA } from "@/config/chains"
import { useToast } from "@/hooks/use-toast"

export function CoffeeForm() {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [amount, setAmount] = useState<string>(WEEK2_CONFIG.defaultAmountEth)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const wallet = useWallet(SEPOLIA)
  const { sendTransaction } = useContract(
    WEEK2_CONFIG.contractAddress,
    COFFEE_ABI,
    wallet
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet.isConnected) {
      await wallet.connect()
      return
    }

    const finalName = name.trim() || "Anonymous"
    const finalMessage = message.trim() || "Thanks!"

    try {
      setSending(true)
      const parsedAmount = parseEther(amount)
      
      const tx = await sendTransaction("buyCoffee", finalName, finalMessage, {
        value: parsedAmount,
      })

      toast({
        title: "Transaction sent",
        description: "Waiting for confirmation...",
      })

      await tx.wait()

      toast({
        title: "Coffee sent!",
        description: "Thanks for supporting 🎉",
      })

      setName("")
      setMessage("")
      setAmount(WEEK2_CONFIG.defaultAmountEth)
    } catch (error: any) {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold">SEND A TIP</span>
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
          Sepolia
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="coffee-name">Your Name</Label>
          <Input
            id="coffee-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous Supporter"
          />
        </div>

        <div>
          <Label htmlFor="coffee-message">Message</Label>
          <Textarea
            id="coffee-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave an encouraging message..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="coffee-amount">Amount (ETH)</Label>
          <Input
            id="coffee-amount"
            type="number"
            min="0.0001"
            step="0.0001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          {!wallet.isConnected ? (
            <Button
              type="button"
              onClick={() => wallet.connect()}
              disabled={wallet.isConnecting}
              className="flex-1"
            >
              {wallet.isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          ) : (
            <Button type="submit" disabled={sending} className="flex-1">
              {sending ? "Sending..." : "Send Coffee ☕"}
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}

