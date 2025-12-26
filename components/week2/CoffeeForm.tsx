"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/useWallet"
import { useContract } from "@/hooks/useContract"
import { WEEK2_CONFIG, COFFEE_ABI } from "@/lib/config/contracts"
import { parseEther } from "@/lib/utils"
import { extractErrorMessage } from "@/lib/errors"
import { SEPOLIA } from "@/lib/config/chains"
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
        description: "Thanks for supporting!",
      })

      setName("")
      setMessage("")
      setAmount(WEEK2_CONFIG.defaultAmountEth)
    } catch (error: unknown) {
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
    <Card variant="week2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="week2">SEND A TIP</Badge>
          <Badge variant="outline">Sepolia</Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="coffee-name" className="font-mono text-xs tracking-wider uppercase">
              Your Name
            </Label>
            <Input
              id="coffee-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anonymous Supporter"
              className="border-week2/30 focus-visible:border-week2 focus-visible:ring-week2/20 focus-visible:shadow-glow-week2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee-message" className="font-mono text-xs tracking-wider uppercase">
              Message
            </Label>
            <Textarea
              id="coffee-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave an encouraging message..."
              rows={3}
              className="border-week2/30 focus-visible:border-week2 focus-visible:ring-week2/20 focus-visible:shadow-glow-week2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coffee-amount" className="font-mono text-xs tracking-wider uppercase">
              Amount (ETH)
            </Label>
            <Input
              id="coffee-amount"
              type="number"
              min="0.0001"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono border-week2/30 focus-visible:border-week2 focus-visible:ring-week2/20 focus-visible:shadow-glow-week2"
            />
          </div>

          <div className="pt-2">
            {!wallet.isConnected ? (
              <Button
                type="button"
                variant="week2"
                onClick={() => wallet.connect()}
                disabled={wallet.isConnecting}
                className="w-full"
              >
                {wallet.isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="week2"
                disabled={sending}
                className="w-full"
              >
                {sending ? "SENDING..." : "SEND COFFEE"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
