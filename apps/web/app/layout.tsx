import type { Metadata } from "next"
import {
  IBM_Plex_Mono,
  Instrument_Serif,
  Plus_Jakarta_Sans,
} from "next/font/google"
import "./globals.css"
import { Toaster } from "@road/shared"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-mono",
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
    <html
      lang="en"
      className={`dark ${plusJakartaSans.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
