import type { WeekModule } from "@road/config"

export const week04Module: WeekModule = {
  id: 4,
  slug: "week-04",
  title: "Create an NFT Gallery",
  status: "ready",
  networks: ["Ethereum Mainnet"],
  supportsStaticExport: true,
  loadPage: async () => (await import("./page")).default,
  runbook: {
    web: "pnpm week:dev --week=4",
    contracts: "pnpm week:contracts --week=4",
    e2e: "pnpm week:test --week=4",
  },
}
