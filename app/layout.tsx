import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Instrument_Serif, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
})

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
      <body className={`${plusJakarta.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

