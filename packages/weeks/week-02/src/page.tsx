"use client"

import Link from "next/link"
import { Badge, Card, CoffeeForm, MemoBoard, WEEK2_CONFIG, truncateAddress } from "@road/shared"

export default function Week02Page() {
  return (
    <div>
      <div className="mb-8">
        <Badge variant="outline" className="mb-4">
          Week 2
        </Badge>
        <h1 className="text-4xl font-bold mb-3">Buy Me a Coffee dApp</h1>
        <p className="text-muted-foreground">
          Interactive tipping contract with on-chain memos - Building real Web3 functionality
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <CoffeeForm />
        <MemoBoard />
      </div>

      <Card variant="glass" className="p-6">
        <h3 className="text-xl font-bold mb-4">Contract Information</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Contract</span>
            <div>
              <Link
                href={`${WEEK2_CONFIG.explorer}/address/${WEEK2_CONFIG.contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm hover:text-accent-cyan transition-colors"
              >
                {truncateAddress(WEEK2_CONFIG.contractAddress)}
              </Link>
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Network</span>
            <div className="text-sm">{WEEK2_CONFIG.chainName}</div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Type</span>
            <div className="text-sm">Tipping Contract</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
