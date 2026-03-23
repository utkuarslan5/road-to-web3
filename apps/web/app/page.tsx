import Link from "next/link"
import { redirect } from "next/navigation"
import {
  AppShell,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@road/shared"
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
            variant="glass"
            className={week.featured ? "border-primary/40" : undefined}
          >
            <CardHeader spacing="roomy" padding="roomy" className="pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">Week {week.id}</Badge>
                {week.featured && <Badge variant="score">Featured</Badge>}
                <Badge variant="secondary">{week.networks.join(", ")}</Badge>
              </div>
              <div className="flex flex-col gap-3">
                <CardTitle size="xl" className="font-bold">
                  {week.title}
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-relaxed">
                  {week.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent padding="roomy">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <Link href={week.href}>
                  <Button className="w-full md:w-auto">
                    View Full Project →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  )
}
