import type { WeekModule } from "@road/config"

export const week09Module: WeekModule = {
  id: 9,
  slug: "week-09",
  title: "Build a Token Swap DApp",
  status: "stub",
  networks: ["Ethereum Mainnet"],
  supportsStaticExport: true,
  loadPage: async () => (await import("./page")).default,
  runbook: {
    web: "pnpm week:dev --week=9",
    contracts: "pnpm week:contracts --week=9",
    e2e: "pnpm week:test --week=9",
  },
}
