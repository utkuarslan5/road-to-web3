"use client"

import { Card } from "@/components/ui/card"
import { WEEK1_CONFIG } from "@/lib/contracts"
import { truncateAddress } from "@/lib/utils"
import Link from "next/link"

export function ContractDetails() {
  return (
    <Card className="glass p-6">
      <h3 className="text-xl font-bold mb-4">Contract Details</h3>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm text-muted-foreground mb-1">Contract Address</dt>
          <dd>
            <Link
              href={`https://sepolia.etherscan.io/address/${WEEK1_CONFIG.contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm hover:text-accent-cyan transition-colors"
            >
              {truncateAddress(WEEK1_CONFIG.contractAddress)}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground mb-1">Token Standard</dt>
          <dd className="text-sm">ERC-721</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground mb-1">Token ID</dt>
          <dd className="text-sm">#{WEEK1_CONFIG.tokenId}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground mb-1">Network</dt>
          <dd className="text-sm">Sepolia (Chain ID: 11155111)</dd>
        </div>
      </dl>
    </Card>
  )
}

