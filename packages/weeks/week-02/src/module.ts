import type { WeekModule } from "@road/config"

export const week02Module: WeekModule = {
  id: 2,
  slug: "week-02",
  title: "Build a Buy Me a Coffee DeFi dApp",
  status: "ready",
  networks: ["Sepolia"],
  supportsStaticExport: true,
  loadPage: async () => (await import("./page")).default,
  runbook: {
    web: "pnpm week:dev --week=2",
    contracts: "pnpm week:contracts --week=2",
    e2e: "pnpm week:test --week=2",
  },
}
