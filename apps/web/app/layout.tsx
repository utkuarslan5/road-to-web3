import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@road/shared"

export const metadata: Metadata = {
  title: "Road to Web3 · Trophy Collection",
  description: "My journey through Road to Web3 - A collection of on-chain achievements and interactive dApps",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
