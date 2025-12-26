"use client"

import { Card } from "@/components/ui/card"

export function Header() {
  return (
    <header className="relative w-full py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold">
          ONCHAIN PORTFOLIO
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Road to Web3
          <span className="block gradient-text">Trophy Collection</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
          A curated showcase of on-chain achievements, smart contracts, and interactive Web3 experiences.
          Each week represents a new milestone in blockchain development.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Card className="glass px-8 py-6 min-w-[200px]">
            <div className="text-4xl font-bold mb-2">3</div>
            <div className="text-sm text-muted-foreground">Weeks Completed</div>
          </Card>
          <Card className="glass px-8 py-6 min-w-[200px]">
            <div className="text-4xl font-bold mb-2">3</div>
            <div className="text-sm text-muted-foreground">Contracts Deployed</div>
          </Card>
          <Card className="glass px-8 py-6 min-w-[200px]">
            <div className="text-4xl font-bold mb-2">2</div>
            <div className="text-sm text-muted-foreground">Networks</div>
          </Card>
        </div>
      </div>
    </header>
  )
}

