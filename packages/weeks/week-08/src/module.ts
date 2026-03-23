import type { WeekModule } from "@road/config"

export const week08Module: WeekModule = {
  id: 8,
  slug: "week-08",
  title: "Build a Blockchain Betting Game",
  status: "stub",
  networks: ["Optimism"],
  supportsStaticExport: true,
  loadPage: async () => (await import("./page")).default,
  runbook: {
    web: "pnpm week:dev --week=8",
    contracts: "pnpm week:contracts --week=8",
    e2e: "pnpm week:test --week=8",
  },
}
