# Road to Web3 - Trophy Collection 🏆

A beautifully designed portfolio showcasing your Web3 development journey. Each week represents a milestone with deployed smart contracts and interactive dApps.

![Modern Designer Interface](https://img.shields.io/badge/Design-Modern-blueviolet) ![Web3](https://img.shields.io/badge/Web3-Enabled-success) ![Smart Contracts](https://img.shields.io/badge/Contracts-3-blue)

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

### Week 3: Chain Battles ⚔️ NEW!
- **Contract**: Deploy with funds (see instructions below)
- **Network**: Polygon Amoy Testnet
- **Type**: Dynamic NFT with Gaming Mechanics
- Mint warrior NFTs with randomized stats
- Training system with 60-second cooldowns
- PvP battle mechanics
- Fully on-chain SVG rendering
- 5 rarity tiers (Common → Mythic)
- Real-time stat tracking

## 🚀 Quick Start

### 1. Clone and View Locally

```bash
# Open the project
cd road-to-web3

# Serve locally (use any static server)
npx serve .
# Or use Python
python -m http.server 8000
# Or use VS Code Live Server extension
```

Visit `http://localhost:8000` to view your trophy collection!

### 2. Deploy Week 3 Contract

#### Prerequisites
- Get Polygon Amoy testnet MATIC from [faucet](https://faucet.polygon.technology/)
- Have your wallet private key ready

#### Deployment Steps

```bash
cd week3

# Install dependencies (if not already done)
pnpm install

# Create .env file with your credentials
cat > .env << EOF
TESTNET_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_private_key_here
EOF

# Deploy the contract
node scripts/deploy.js
```

#### Update the Website

After deployment, update [app.js:35](app.js#L35) with your deployed contract address:

```javascript
const week3Config = {
  contractAddress: "YOUR_DEPLOYED_ADDRESS_HERE", // Replace this
  chainId: 80002n,
  // ... rest of config
};
```

## 🎨 Design System

### Modern & Clean
- **Dark theme** with gradient accents
- **Glassmorphism** effects with backdrop blur
- **Smooth animations** and transitions
- **Responsive design** works on all devices

### Color Palette
- Primary Background: `#0a0e1a`
- Accent Gradients: Purple → Blue → Pink
- Success: `#10b981`
- Chains: Sepolia (Blue), Polygon (Purple)

### Typography
- Display: Space Grotesk
- Body: Inter
- Code: JetBrains Mono / Fira Code

## 📱 Features Overview

### Trophy Collection Layout
- **Hero Section**: Portfolio stats and introduction
- **Week Navigation**: Sticky nav to jump between weeks
- **Trophy Cards**: Each week in its own card with:
  - Live contract data
  - Interactive elements
  - Network indicators
  - Status updates

### Wallet Integration
- MetaMask support
- Automatic network switching
- Transaction status tracking
- Error handling with user-friendly messages

### NFT Viewing
- Real-time data from blockchain
- IPFS image loading with fallbacks
- Dynamic SVG display for Week 3
- Stat visualization

## 🛠️ Tech Stack

### Frontend
- **Vanilla JavaScript** (no framework overhead)
- **ethers.js v6** for Web3 interactions
- **Modern CSS** with CSS Custom Properties
- **Responsive Design** with CSS Grid & Flexbox

### Smart Contracts
- **Solidity ^0.8.0**
- **OpenZeppelin** contracts
- **Hardhat** for development
- **Etherscan/Polygonscan** verification ready

### Networks
- **Sepolia** (Ethereum Testnet) - Weeks 1 & 2
- **Polygon Amoy** (L2 Testnet) - Week 3

## 📂 Project Structure

```
road-to-web3/
├── index.html          # Main trophy collection page
├── app.js              # Web3 integration & logic
├── styles.css          # Modern designer styles
├── README.md           # This file
├── week2/              # Buy Me a Coffee contract
│   ├── contracts/
│   ├── scripts/
│   └── hardhat.config.ts
└── week3/              # Chain Battles contract
    ├── contracts/
    │   └── chain_battles.sol
    ├── scripts/
    │   └── deploy.js
    └── hardhat.config.ts
```

## 🎮 Using the dApp

### Week 1: View Your Trophy
1. Page loads automatically
2. NFT fetches from Sepolia
3. Displays metadata and image

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

## 🔧 Customization

### Update Contract Addresses
Edit [app.js](app.js) configuration objects:
- `week1Config` (lines 1-14)
- `week2Config` (lines 16-25)
- `week3Config` (lines 32-42)

### Customize Styling
Edit [styles.css](styles.css) CSS custom properties:
- Colors (lines 6-31)
- Spacing (lines 53-59)
- Typography (lines 68-71)

### Add More Weeks
1. Create new contract directory (`week4/`)
2. Add trophy section to `index.html`
3. Add integration to `app.js`
4. Style in `styles.css`

## 🌐 Deployment

### GitHub Pages
```bash
# Enable GitHub Pages in repo settings
# Point to main branch, root directory
# Your site will be live at: https://YOUR_USERNAME.github.io/road-to-web3/
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Drag and drop the folder on netlify.com
# Or use CLI
netlify deploy --prod
```

## 📝 Notes

### Week 3 Contract Deployment
- **IMPORTANT**: You need Polygon Amoy testnet MATIC to deploy
- Get free testnet MATIC from the [Polygon Faucet](https://faucet.polygon.technology/)
- The contract address is currently a placeholder: `0x0000000000000000000000000000000000000000`
- After deployment, update `week3Config.contractAddress` in [app.js:35](app.js#L35)

### RPC Endpoints
The project uses Alchemy RPC endpoints. You can:
- Use the existing endpoints (rate-limited)
- Get your own free Alchemy API key at [alchemy.com](https://www.alchemy.com/)
- Replace RPC URLs in the config objects

### Browser Compatibility
- Requires MetaMask or compatible Web3 wallet
- Modern browser with ES6+ support
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

---

Built with ❤️ for Road to Web3 · 2025

**Questions?** Open an issue or reach out on Twitter!
