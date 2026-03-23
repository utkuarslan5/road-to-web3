import type { WeekModule } from "@road/config"

export const week06Module: WeekModule = {
  id: 6,
  slug: "week-06",
  title: "Build a Staking Application",
  status: "ready",
  networks: ["Sepolia"],
  supportsStaticExport: true,
  loadPage: async () => (await import("./page")).default,
  runbook: {
    web: "pnpm week:dev --week=6",
    contracts: "pnpm week:contracts --week=6",
    e2e: "pnpm week:test --week=6",
  },
}
