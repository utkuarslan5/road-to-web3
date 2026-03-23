import Link from "next/link"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getHomepageRoadmapItems } from "@road/config"

export default function Home() {
  const targetWeek = process.env.ROAD_DEFAULT_WEEK
  if (targetWeek) {
    redirect(`/weeks/${targetWeek}`)
  }

  const weeks = getHomepageRoadmapItems()

  return (
    <AppShell>
      <div className="space-y-12">
        {weeks.map((week) => (
          <Card
            key={week.id}
            className={`glass p-8 ${week.featured ? "border-pink-500/50" : ""}`}
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <span className="px-4 py-1 rounded-full bg-white/10 text-sm font-semibold">
                    Week {week.id}
                  </span>
                  {week.featured && (
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-sm font-semibold">
                      ✨ New
                    </span>
                  )}
                  <span className="px-4 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-semibold">
                    {week.networks.join(", ")}
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
    </AppShell>
  )
}
