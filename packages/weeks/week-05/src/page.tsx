"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Badge,
  BULLBEAR_ABI,
  BullBearDisplay,
  Button,
  Card,
  extractErrorMessage,
  SEPOLIA,
  truncateAddress,
  useContract,
  useToast,
  useWallet,
  WEEK5_BULLBEAR_CONFIG,
} from "@road/shared"

export default function Week05Page() {
  const wallet = useWallet(SEPOLIA)
  const { toast } = useToast()
  const { call, sendTransaction } = useContract(
    WEEK5_BULLBEAR_CONFIG.contractAddress,
    BULLBEAR_ABI,
    wallet
  )
  const [minting, setMinting] = useState(false)
  const [contractOwner, setContractOwner] = useState<string | null>(null)
  const [ownerLoading, setOwnerLoading] = useState(false)

  const isOwner = useMemo(() => {
    if (!wallet.address || !contractOwner) return false
    return wallet.address.toLowerCase() === contractOwner.toLowerCase()
  }, [wallet.address, contractOwner])

  useEffect(() => {
    if (!wallet.isConnected) {
      setContractOwner(null)
      return
    }

    const loadOwner = async () => {
      try {
        setOwnerLoading(true)
        const owner = await call<string>("owner")
        setContractOwner(owner)
      } catch {
        setContractOwner(null)
      } finally {
        setOwnerLoading(false)
      }
    }

    loadOwner()
  }, [wallet.isConnected, call])

  const handleMint = async () => {
    if (!wallet.isConnected) {
      await wallet.connect()
      return
    }

    if (!wallet.address) return

    try {
      setMinting(true)
      const tx = await sendTransaction("safeMint", wallet.address)
      toast({
        title: "Transaction submitted",
        description: "Mint request sent. Waiting for confirmation...",
      })
      await tx.wait()
      toast({
        title: "Mint requested",
        description: "Your Bull & Bear mint transaction is confirmed.",
      })
    } catch (error: unknown) {
      const message = extractErrorMessage(error)
      const lower = message.toLowerCase()
      const isOwnerError = lower.includes("onlyowner") || lower.includes("ownable") || lower.includes("not owner")

      toast({
        title: "Mint failed",
        description: isOwnerError
          ? "This contract currently allows only the owner wallet to mint."
          : message,
        variant: "destructive",
      })
    } finally {
      setMinting(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-sm font-semibold mb-4">
          Week 5
        </span>
        <h1 className="text-4xl font-bold mb-3">Bull & Bear NFT</h1>
        <p className="text-muted-foreground">
          A dynamic NFT that flips between Bull and Bear based on the live BTC/USD price, updated
          automatically with Chainlink Automation and minted with Chainlink VRF randomness across
          multiple random visual variants.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <BullBearDisplay />
        <Card className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Contract</h3>
            <Badge variant="outline">Sepolia</Badge>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="font-mono text-xs break-all text-right">
                {WEEK5_BULLBEAR_CONFIG.contractAddress}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Token shown</dt>
              <dd className="font-mono">#1</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Explorer</dt>
              <dd>
                <Link
                  href={`${WEEK5_BULLBEAR_CONFIG.explorer}/address/${WEEK5_BULLBEAR_CONFIG.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs hover:text-accent-cyan transition-colors"
                >
                  View contract
                </Link>
              </dd>
            </div>
            {wallet.isConnected && contractOwner && (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Owner</dt>
                <dd className="font-mono text-xs">{truncateAddress(contractOwner)}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Mint</h3>
          <Badge variant="outline">safeMint(address)</Badge>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Connect wallet and mint a new Bull & Bear NFT to your own address.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleMint} disabled={wallet.isConnecting || minting || ownerLoading}>
            {!wallet.isConnected
              ? wallet.isConnecting
                ? "CONNECTING..."
                : "CONNECT WALLET"
              : minting
              ? "MINTING..."
              : "MINT TO MY WALLET"}
          </Button>
          {wallet.isConnected && wallet.address && (
            <span className="text-xs font-mono text-muted-foreground">
              Connected: {truncateAddress(wallet.address)}
            </span>
          )}
        </div>
        {wallet.isConnected && !ownerLoading && !isOwner && (
          <p className="text-xs text-muted-foreground mt-3">
            Note: this contract appears owner-gated. Non-owner wallets may not be able to mint.
          </p>
        )}
      </Card>
    </div>
  )
}
