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
```

Legacy compatibility key (optional):

```bash
NEXT_PUBLIC_ALCHEMY_API_KEY=...
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
