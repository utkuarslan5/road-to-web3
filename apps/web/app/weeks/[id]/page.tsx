import { notFound } from "next/navigation"
import type { ComponentType } from "react"
import { AppShell, Badge, Card } from "@road/shared"
import { getWeekModule } from "@/lib/week-registry"

export async function generateStaticParams() {
  return Array.from({ length: 10 }, (_, idx) => ({ id: String(idx + 1) }))
}

export default async function WeekRoutePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  if (!Number.isInteger(numericId) || numericId < 1 || numericId > 10) {
    notFound()
  }

  const weekModule = getWeekModule(numericId)
  if (!weekModule) {
    notFound()
  }

  const loadedPage = await weekModule.loadPage()
  if (!loadedPage) {
    notFound()
  }
  const WeekPage = loadedPage as ComponentType

  return (
    <AppShell>
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <Badge variant={weekModule.status === "ready" ? "success" : "secondary"}>
          {weekModule.status === "ready" ? "READY" : "STUB"}
        </Badge>
        <div className="text-sm text-muted-foreground font-mono">
          {weekModule.runbook.web}
        </div>
      </div>
      <WeekPage />
      {numericId === 6 && weekModule.status === "stub" && (
        <Card variant="glass" className="mt-8 border-dashed">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Implementation Scaffold Ready</h3>
            <p className="text-muted-foreground text-sm">
              This week is set up with canonical routing, runbook commands, and contract package scaffold.
            </p>
          </div>
        </Card>
      )}
    </AppShell>
  )
}
