import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const weeks = [
  {
    number: 1,
    title: "LabMint Trophy",
    description: "My first NFT deployed to Sepolia testnet - A foundational achievement in Web3 development",
    href: "/week1",
    network: "Sepolia",
  },
  {
    number: 2,
    title: "Buy Me a Coffee",
    description: "Interactive tipping contract with on-chain memos - Building real Web3 functionality",
    href: "/week2",
    network: "Sepolia",
  },
  {
    number: 3,
    title: "Chain Battles",
    description: "Dynamic on-chain NFTs with training, battles, and fully rendered SVG graphics",
    href: "/week3",
    network: "Polygon Amoy",
  },
  {
    number: 4,
    title: "NFT Gallery",
    description: "Browse NFTs from Ethereum mainnet using Alchemy API - Search by wallet or collection",
    href: "/week4",
    network: "Ethereum Mainnet",
    featured: true,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="space-y-12">
          {weeks.map((week) => (
            <Card
              key={week.number}
              className={`glass p-8 ${week.featured ? "border-pink-500/50" : ""}`}
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-4 py-1 rounded-full bg-white/10 text-sm font-semibold">
                      Week {week.number}
                    </span>
                    {week.featured && (
                      <span className="px-4 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-sm font-semibold">
                        ✨ New
                      </span>
                    )}
                    <span className="px-4 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-semibold">
                      {week.network}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-3">{week.title}</h2>
                  <p className="text-muted-foreground mb-6">{week.description}</p>
                  <Link href={week.href}>
                    <Button className="w-full md:w-auto">
                      View Full Project →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

