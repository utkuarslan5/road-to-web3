export type WeekId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface WeekRoadmapItem {
  id: WeekId
  slug: string
  title: string
  description: string
  tutorialUrl: string
  status: "ready" | "stub"
  networks: string[]
}

export interface WeekModule {
  id: WeekId
  slug: string
  title: string
  status: "ready" | "stub"
  networks: string[]
  supportsStaticExport: boolean
  loadPage: () => Promise<unknown>
  runbook: {
    web: string
    contracts?: string
    e2e?: string
  }
}
