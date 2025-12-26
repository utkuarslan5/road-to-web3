"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const weeks = [
  { number: 1, label: "Week 1", href: "/week1" },
  { number: 2, label: "Week 2", href: "/week2" },
  { number: 3, label: "Week 3", href: "/week3" },
  { number: 4, label: "Week 4", href: "/week4" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full py-4 px-4 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-3">
        {weeks.map((week) => {
          const isActive = pathname === week.href || (pathname === "/" && week.number === 1)
          return (
            <Link
              key={week.number}
              href={week.href}
              className={cn(
                "px-6 py-2 rounded-full border transition-all",
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white shadow-lg shadow-purple-500/30"
                  : "bg-transparent border-border text-muted-foreground hover:bg-white/5 hover:border-white/20 hover:text-foreground"
              )}
            >
              {week.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

