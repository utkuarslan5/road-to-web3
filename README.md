# Road to Web3 Unified Platform

Static-first monorepo for the Road to Web3 curriculum. The repo is organized as a shared Next.js portal plus per-week UI and contract packages.

## Monorepo Layout

- `apps/web` - unified Next.js app and canonical week routes at `/weeks/[id]`
- `packages/config` - typed roadmap data and shared week interfaces
- `packages/shared` - shared design system, hooks, config, and web3 utilities
- `packages/weeks/week-01..week-10` - page modules (`loadPage`, runbook, status)
- `packages/contracts/week-01..week-10` - Hardhat 3 contract packages

## Current State

- Weeks `1-4` are live in the unified portal
- Week `6` is live and wired to Sepolia contracts
- Week `5` has a functional UI and contract package, but its module is still marked `stub`
- Weeks `7-10` are scaffolded placeholders with routing, runbooks, and shared primitives in place

## Requirements

- Node.js `20+`
- pnpm `9+`

## Install

```bash
pnpm install
```

## Development Commands

```bash
# Unified portal
pnpm dev

# Focus the portal on a specific week (sets ROAD_DEFAULT_WEEK)
pnpm week:dev --week=6

# Compile contracts for one week
pnpm week:contracts --week=6

# Run tests for one week contract package
pnpm week:test --week=6

# App typecheck
pnpm typecheck

# Design system checks
pnpm design:lint
```

## Build

```bash
pnpm build
```

Static export output is written to `apps/web/out`.

## Environment

Create `.env.local` at the repository root.

### Required RPC Keys

- `NEXT_PUBLIC_ALCHEMY_MAINNET_API_KEY`
- `NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY`
- `NEXT_PUBLIC_ALCHEMY_POLYGON_AMOY_API_KEY`

### Optional Contract Address Overrides

Public contract addresses are now committed in shared config. Use env overrides only when you want to temporarily point the site at different deployments:

- `NEXT_PUBLIC_WEEK1_TROPHY_ADDRESS`
- `NEXT_PUBLIC_WEEK2_COFFEE_ADDRESS`
- `NEXT_PUBLIC_WEEK3_CHAIN_BATTLES_ADDRESS`
- `NEXT_PUBLIC_WEEK3_DEPLOYER_ADDRESS`
- `NEXT_PUBLIC_WEEK5_BULLBEAR_ADDRESS`
- `NEXT_PUBLIC_WEEK6_STAKER_ADDRESS`
- `NEXT_PUBLIC_WEEK6_EXAMPLE_EXTERNAL_CONTRACT_ADDRESS`

### Optional Deployment Credentials

Used by contract packages and deployment scripts:

- `PRIVATE_KEY`
- `SEPOLIA_PRIVATE_KEY` (supported alias for week 6 deploy flow)
- `RPC_URL`
- `ETHERSCAN_API_KEY`
- `INITIAL_REWARD_FUND_ETH`

See `.env.example` for the full template.

## Design System

- Shared primitives live in `packages/shared/src/components/ui`
- Consumers should import primitives from `@road/shared`
- Lapidist design lint enforces:
  - shared import paths
  - approved primitive `variant` values
  - no inline style usage on design-system components

Config files:

- `designlint.config.mjs`
- `designlint.shared.config.mjs`

## Canonical Routes

- Home: `/`
- Week pages: `/weeks/1` through `/weeks/10`

## Notes

- `packages/shared` is the source of truth for shared UI and web3 logic
- `apps/web` now only owns Next-specific concerns: routing, global styles, export config, and the week registry
- old `apps/web` compatibility shims were removed; consumers should import from `@road/shared` directly
- Tailwind content scanning includes `packages/shared/src` and `packages/weeks/*/src`, so shared styles render correctly in the app
