import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { CoffeeForm } from "@/components/week2/CoffeeForm"
import { MemoBoard } from "@/components/week2/MemoBoard"
import { Card } from "@/components/ui/card"
import { WEEK2_CONFIG } from "@/lib/config/contracts"
import { truncateAddress } from "@/lib/utils"
import Link from "next/link"

export default function Week2Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="mb-8">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-sm font-semibold mb-4">
            Week 2
          </span>
          <h1 className="text-4xl font-bold mb-3">Buy Me a Coffee dApp</h1>
          <p className="text-muted-foreground">
            Interactive tipping contract with on-chain memos - Building real Web3 functionality
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <CoffeeForm />
          <MemoBoard />
        </div>

        <Card className="glass p-6">
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
      </main>
      <Footer />
    </div>
  )
}

