# Setup Instructions

This repository now uses a `pnpm` workspace monorepo.

## 1) Install dependencies

```bash
pnpm install
```

## 2) Configure environment

Create `.env.local` at the repository root with:

```bash
NEXT_PUBLIC_ALCHEMY_MAINNET_API_KEY=...
NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY=...
NEXT_PUBLIC_ALCHEMY_POLYGON_AMOY_API_KEY=...

NEXT_PUBLIC_WEEK1_TROPHY_ADDRESS=...
NEXT_PUBLIC_WEEK2_COFFEE_ADDRESS=...
NEXT_PUBLIC_WEEK3_CHAIN_BATTLES_ADDRESS=...
NEXT_PUBLIC_WEEK3_DEPLOYER_ADDRESS=...
NEXT_PUBLIC_WEEK5_BULLBEAR_ADDRESS=...
NEXT_PUBLIC_WEEK6_STAKER_ADDRESS=...
NEXT_PUBLIC_WEEK6_EXAMPLE_EXTERNAL_CONTRACT_ADDRESS=...
```

Legacy compatibility key (optional):

```bash
NEXT_PUBLIC_ALCHEMY_API_KEY=...
```

Optional deployment keys:

```bash
PRIVATE_KEY=...
SEPOLIA_PRIVATE_KEY=...
RPC_URL=...
ETHERSCAN_API_KEY=...
INITIAL_REWARD_FUND_ETH=1.1
```

## 3) Start development

```bash
pnpm dev
```

## 4) Target an individual week

```bash
pnpm week:dev --week=1
pnpm week:contracts --week=1
pnpm week:test --week=1
```

## 5) Validation

```bash
pnpm typecheck
pnpm design:lint
pnpm build
```

## 6) Week 6 notes

- Week 6 is wired for Sepolia and uses env-backed addresses
- The `Staker` contract now starts its timer on first stake, not at deployment
- The deploy flow supports both `PRIVATE_KEY` and `SEPOLIA_PRIVATE_KEY`
