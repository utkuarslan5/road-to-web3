"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const weeks = [
  {
    number: 1,
    label: "LV.1",
    title: "NFT",
    href: "/week1",
    color: "week1",
    glowClass: "hover:shadow-glow-week1",
    activeClass: "bg-week1 text-void shadow-glow-week1 border-week1"
  },
  {
    number: 2,
    label: "LV.2",
    title: "TIP",
    href: "/week2",
    color: "week2",
    glowClass: "hover:shadow-glow-week2",
    activeClass: "bg-week2 text-void shadow-glow-week2 border-week2"
  },
  {
    number: 3,
    label: "LV.3",
    title: "GAME",
    href: "/week3",
    color: "week3",
    glowClass: "hover:shadow-glow-week3",
    activeClass: "bg-week3 text-white shadow-glow-week3 border-week3"
  },
  {
    number: 4,
    label: "LV.4",
    title: "VIEW",
    href: "/week4",
    color: "week4",
    glowClass: "hover:shadow-glow-week4",
    activeClass: "bg-week4 text-void shadow-glow-week4 border-week4"
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full py-4 px-4 bg-void/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto">
        {/* Mobile: Center the nav */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-cabinet border border-border">
            {weeks.map((week) => {
              const isActive = pathname === week.href || (pathname === "/" && week.number === 1)
              return (
                <Link
                  key={week.number}
                  href={week.href}
                  className={cn(
                    "flex flex-col items-center px-4 py-2 rounded-lg border-2 transition-all duration-200 font-mono",
                    isActive
                      ? week.activeClass
                      : `bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-screen ${week.glowClass}`
                  )}
                >
                  <span className="text-xs font-bold tracking-wider">{week.label}</span>
                  <span className="text-[10px] tracking-widest opacity-70">{week.title}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
