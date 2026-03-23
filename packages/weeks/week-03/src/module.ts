import type { WeekModule } from "@road/config"

export const week03Module: WeekModule = {
  id: 3,
  slug: "week-03",
  title: "Make NFTs with On-Chain Metadata",
  status: "ready",
  networks: ["Polygon Amoy"],
  supportsStaticExport: true,
  loadPage: async () => (await import("./page")).default,
  runbook: {
    web: "pnpm week:dev --week=3",
    contracts: "pnpm week:contracts --week=3",
    e2e: "pnpm week:test --week=3",
  },
}
