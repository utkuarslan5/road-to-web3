import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { NFTDisplay } from "@/components/week1/NFTDisplay"
import { ContractDetails } from "@/components/week1/ContractDetails"
import { Card } from "@/components/ui/card"

export default function Week1Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="mb-8">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-sm font-semibold mb-4">
            Week 1
          </span>
          <h1 className="text-4xl font-bold mb-3">LabMint Trophy</h1>
          <p className="text-muted-foreground">
            My first NFT deployed to Sepolia testnet - A foundational achievement in Web3 development
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <NFTDisplay />
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
      </main>
      <Footer />
    </div>
  )
}

