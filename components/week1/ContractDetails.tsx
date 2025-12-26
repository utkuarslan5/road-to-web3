"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WEEK1_CONFIG } from "@/lib/contracts"
import { truncateAddress } from "@/lib/utils"
import Link from "next/link"

export function ContractDetails() {
  return (
    <Card variant="week1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl">Contract Details</h3>
          <Badge variant="week1">ERC-721</Badge>
        </div>

        <dl className="space-y-4">
          <DetailRow
            label="CONTRACT"
            value={
              <Link
                href={`https://sepolia.etherscan.io/address/${WEEK1_CONFIG.contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm text-week1 hover:text-neon-cyan transition-colors hover:underline"
              >
                {truncateAddress(WEEK1_CONFIG.contractAddress)}
              </Link>
            }
          />
          <DetailRow
            label="TOKEN ID"
            value={
              <span className="font-mono text-sm text-foreground">
                #{WEEK1_CONFIG.tokenId}
              </span>
            }
          />
          <DetailRow
            label="NETWORK"
            value={
              <span className="text-sm text-foreground">
                Sepolia <span className="text-muted-foreground">(11155111)</span>
              </span>
            }
          />
          <DetailRow
            label="STANDARD"
            value={
              <span className="text-sm text-foreground">ERC-721</span>
            }
          />
        </dl>
      </CardContent>
    </Card>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <dt className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  )
}
