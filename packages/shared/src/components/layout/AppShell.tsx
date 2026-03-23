import { Header } from "./Header"
import { Navigation } from "./Navigation"
import { Footer } from "./Footer"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">{children}</main>
      <Footer />
    </div>
  )
}
