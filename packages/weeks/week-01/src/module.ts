import type { WeekModule } from "@road/config"

export const week01Module: WeekModule = {
  id: 1,
  slug: "week-01",
  title: "Develop an NFT Smart Contract",
  status: "ready",
  networks: ["Sepolia"],
  supportsStaticExport: true,
  loadPage: async () => (await import("./page")).default,
  runbook: {
    web: "pnpm week:dev --week=1",
    contracts: "pnpm week:contracts --week=1",
    e2e: "pnpm week:test --week=1",
  },
}
