# Road to Web3 Unified Platform

Unified static-first monorepo for all 10 weeks of the Road to Web3 track.

## Monorepo Layout

- `apps/web` - unified Next.js portal and canonical week routes (`/weeks/[id]`)
- `packages/config` - typed roadmap + shared week interfaces
- `packages/shared` - shared UI/web3/env compatibility exports
- `packages/weeks/week-01..week-10` - week modules (`loadPage`, runbook, status)
- `packages/contracts/week-01..week-10` - Hardhat 3 contract packages

## Requirements

- Node.js 20+
- pnpm 9+

## Install

```bash
pnpm install
```

## Run

```bash
# Unified portal
pnpm dev

# Run focus mode for a specific week (sets ROAD_DEFAULT_WEEK)
pnpm week:dev --week=4

# Compile contracts for one week
pnpm week:contracts --week=3

# Run tests for one week contract package
pnpm week:test --week=2
```

## Build

```bash
pnpm build
```

Static export output is generated at `apps/web/out`.

## Environment

Create `.env.local` at repository root.

Required keys:

- `NEXT_PUBLIC_ALCHEMY_MAINNET_API_KEY` (canonical)
- `NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY`
- `NEXT_PUBLIC_ALCHEMY_POLYGON_AMOY_API_KEY`

Temporary migration alias also supported:

- `NEXT_PUBLIC_ALCHEMY_API_KEY` (legacy mainnet alias)

## Canonical Routes

- Home: `/`
- Week pages: `/weeks/1` ... `/weeks/10`

## Notes

- Weeks 1-4 are migrated with behavior parity.
- Weeks 5-10 are runnable stubs with scaffolded module + contract packages.
