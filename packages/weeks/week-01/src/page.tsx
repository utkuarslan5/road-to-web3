"use client"

import { BullBearDisplay, Card, ContractDetails, NFTDisplay } from "@road/shared"

export default function Week01Page() {
  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-sm font-semibold mb-4">
          Week 1
        </span>
        <h1 className="text-4xl font-bold mb-3">LabMint Trophy Collection</h1>
        <p className="text-muted-foreground">
          My first NFT plus Bull & Bear collection pieces deployed on Sepolia testnet
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <NFTDisplay />
        <BullBearDisplay />
        <ContractDetails />
      </div>

      <Card className="glass p-6">
        <h3 className="text-xl font-bold mb-4">What I Learned</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li>• Deployed my first ERC-721 NFT contract</li>
          <li>• Interacted with Ethereum testnets</li>
          <li>• Fetched on-chain data via RPC calls</li>
          <li>• Worked with IPFS metadata storage</li>
        </ul>
      </Card>
    </div>
  )
}
