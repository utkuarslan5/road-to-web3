# Road to Web3 - Trophy Collection 🏆

A beautifully designed portfolio showcasing your Web3 development journey. Built with Next.js 14, Tailwind CSS, and shadcn/ui. Each week represents a new milestone in blockchain development.

![Modern Designer Interface](https://img.shields.io/badge/Design-Modern-blueviolet) ![Web3](https://img.shields.io/badge/Web3-Enabled-success) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

### Week 1: LabMint Trophy
- **Contract**: [0xc84a...53DF](https://sepolia.etherscan.io/address/0xc84a1D9044Ceb74EC8C17FfD465f1af6Fe0e53DF)
- **Network**: Sepolia Testnet
- **Type**: ERC-721 NFT
- Live NFT display with IPFS metadata
- Automatic caching for fast load times
- Multi-gateway IPFS fallback

### Week 2: Buy Me a Coffee
- **Contract**: [0x86a5...9ab5](https://sepolia.etherscan.io/address/0x86a531F9Fa82E220B28c854C900178c37CFC9ab5)
- **Network**: Sepolia Testnet
- **Type**: Tipping Contract
- Connect wallet and send tips with messages
- On-chain memo board
- Real-time transaction updates

### Week 3: Chain Battles ⚔️
- **Contract**: [0xa19C...6d4](https://amoy.polygonscan.com/address/0xa19CE93621c003747b58ab98FaD7b419A6C596d4)
- **Network**: Polygon Amoy Testnet
- **Type**: Dynamic NFT with Gaming Mechanics
- Mint warrior NFTs with randomized stats
- Training system with 60-second cooldowns
- PvP battle mechanics
- Fully on-chain SVG rendering
- 5 rarity tiers (Common → Mythic)
- Real-time stat tracking

### Week 4: NFT Gallery 🖼️ NEW!
- **Network**: Ethereum Mainnet
- **Type**: NFT Browser
- Search NFTs by wallet address
- Search NFTs by collection address
- Powered by Alchemy NFT API
- Beautiful grid display with metadata

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd road-to-web3

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Alchemy API key for Week 4
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### GitHub Pages

This project is configured for GitHub Pages deployment using GitHub Actions.

1. **Set up GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (created by GitHub Actions)

2. **Add Environment Variable:**
   - Go to repository Settings → Secrets and variables → Actions
   - Add `NEXT_PUBLIC_ALCHEMY_API_KEY` with your Alchemy API key

3. **Deploy:**
   - Push to `main` branch
   - GitHub Actions will automatically build and deploy

The workflow (`.github/workflows/deploy.yml`) will:
- Build the Next.js app
- Export static files
- Deploy to GitHub Pages

### Manual Deployment

```bash
# Build static export
npm run build

# The `out/` directory contains static files ready for deployment
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful component library
- **ethers.js v6** - Web3 interactions
- **Framer Motion** - Animations

### Smart Contracts
- **Solidity ^0.8.0**
- **OpenZeppelin** contracts
- **Hardhat** for development
- Contract directories kept separate for independent deployment

### Networks
- **Sepolia** (Ethereum Testnet) - Weeks 1 & 2
- **Polygon Amoy** (L2 Testnet) - Week 3
- **Ethereum Mainnet** - Week 4

## 📂 Project Structure

```
road-to-web3/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard/home
│   ├── week1/             # Week 1 page
│   ├── week2/             # Week 2 page
│   ├── week3/             # Week 3 page
│   └── week4/             # Week 4 page
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   └── week*/             # Week-specific components
├── lib/                   # Utilities & services
│   ├── contracts.ts       # Contract configs
│   ├── alchemy.ts         # Alchemy API client
│   ├── ethers.ts          # Ethers helpers
│   └── ipfs.ts            # IPFS helpers
├── hooks/                 # Custom React hooks
├── config/                # Configuration
├── week2-buy-me-a-coffee/ # Contract (separate)
├── week3-on-chain-nft/   # Contract (separate)
└── public/                # Static assets
```

## 🎮 Using the dApp

### Week 1: View Your Trophy
1. Navigate to Week 1 page
2. NFT automatically loads from Sepolia
3. View metadata and image

### Week 2: Send a Coffee
1. Click "Connect Wallet"
2. Approve MetaMask connection
3. Switch to Sepolia if needed
4. Enter name, message, and amount
5. Click "Send Coffee ☕"
6. View your memo on the board!

### Week 3: Battle Warriors
1. Click "Connect Wallet" in Week 3 section
2. Switch to Polygon Amoy when prompted
3. Click "Mint Warrior" to create your NFT
4. Wait 60 seconds, then "Train Warrior"
5. View stats as they increase!
6. Enter any token ID to view other warriors

### Week 4: NFT Gallery
1. Navigate to Week 4 page
2. Choose "Wallet Address" or "Collection Address"
3. Enter an Ethereum address
4. Click "Search NFTs"
5. Browse the NFT grid!

## 🔧 Configuration

### Contract Addresses
Edit `lib/contracts.ts` to update contract addresses and configurations.

### Alchemy API Key
1. Get your API key from [alchemy.com](https://www.alchemy.com/)
2. Add to `.env.local` as `NEXT_PUBLIC_ALCHEMY_API_KEY`
3. For GitHub Pages, add as GitHub Secret

### Styling
- Tailwind config: `tailwind.config.ts`
- Global styles: `app/globals.css`
- Component styles: Use Tailwind classes

## 📝 Notes

### Contract Deployment
- Week 2 and Week 3 contracts are in separate directories
- Deploy contracts independently using Hardhat
- Update contract addresses in `lib/contracts.ts` after deployment

### Browser Compatibility
- Requires MetaMask or compatible Web3 wallet
- Modern browser with ES2020+ support
- JavaScript must be enabled

## 🤝 Contributing

Feel free to:
- Fork this repo
- Customize for your own journey
- Add more weeks/features
- Improve the design
- Submit PRs for bugs

## 📄 License

MIT License - feel free to use this for your own Web3 portfolio!

## 🙏 Acknowledgments

- **Alchemy** for Road to Web3 course
- **OpenZeppelin** for secure contract libraries
- **Hardhat** for development framework
- **ethers.js** for Web3 interactions
- **shadcn/ui** for beautiful components

---

Built with ❤️ for Road to Web3 · 2025
