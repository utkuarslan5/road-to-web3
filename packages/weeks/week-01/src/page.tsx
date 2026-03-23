"use client"

import { Badge, Card, ContractDetails, NFTDisplay } from "@road/shared"

export default function Week01Page() {
  return (
    <div>
      <div className="mb-8">
        <Badge variant="outline" className="mb-4">
          Week 1
        </Badge>
        <h1 className="text-4xl font-bold mb-3">LabMint Trophy</h1>
        <p className="text-muted-foreground">
          My first NFT deployed to Sepolia testnet - A foundational achievement in Web3 development
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <NFTDisplay />
        <ContractDetails />
      </div>

      <Card variant="glass" className="p-6">
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
