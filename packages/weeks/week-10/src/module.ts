import type { WeekModule } from "@road/config"

export const week10Module: WeekModule = {
  id: 10,
  slug: "week-10",
  title: "Build Decentralized Twitter",
  status: "stub",
  networks: ["Sepolia"],
  supportsStaticExport: true,
  loadPage: async () => (await import("./page")).default,
  runbook: {
    web: "pnpm week:dev --week=10",
    contracts: "pnpm week:contracts --week=10",
    e2e: "pnpm week:test --week=10",
  },
}
