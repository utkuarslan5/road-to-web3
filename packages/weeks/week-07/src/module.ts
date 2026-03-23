import type { WeekModule } from "@road/config"

export const week07Module: WeekModule = {
  id: 7,
  slug: "week-07",
  title: "Build an NFT Marketplace",
  status: "stub",
  networks: ["Sepolia"],
  supportsStaticExport: true,
  loadPage: async () => (await import("./page")).default,
  runbook: {
    web: "pnpm week:dev --week=7",
    contracts: "pnpm week:contracts --week=7",
    e2e: "pnpm week:test --week=7",
  },
}
