import type { WeekModule } from "@road/config"

export const week05Module: WeekModule = {
  id: 5,
  slug: "week-05",
  title: "Connect APIs to Your Smart Contract",
  status: "stub",
  networks: ["Sepolia"],
  supportsStaticExport: true,
  loadPage: async () => (await import("./page")).default,
  runbook: {
    web: "pnpm week:dev --week=5",
    contracts: "pnpm week:contracts --week=5",
    e2e: "pnpm week:test --week=5",
  },
}
