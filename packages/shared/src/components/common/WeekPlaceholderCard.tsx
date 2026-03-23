"use client"

import { Badge } from "../ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

export function WeekPlaceholderCard({ week }: { week: number }) {
  return (
    <Card variant="glass" className="border-dashed">
      <CardHeader spacing="roomy">
        <div className="flex items-center gap-3">
          <Badge variant="outline">Week {week}</Badge>
          <Badge variant="secondary">In Progress</Badge>
        </div>
        <div className="flex flex-col gap-2">
          <CardTitle size="lg" className="font-bold">
            Implementation Scaffold Ready
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-relaxed">
            Core routing, package boundaries, and shared primitives are in place. This week is ready for the
            feature implementation pass.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Design system primitives, metadata wiring, and navigation are already connected, so the remaining work is
          specific to the week itself.
        </p>
      </CardContent>
    </Card>
  )
}
