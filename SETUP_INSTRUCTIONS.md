# Setup Instructions

## 1. Local Development Setup

### Create `.env.local` file

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Get Alchemy API Keys

1. Visit https://dashboard.alchemy.com/
2. Sign up or log in
3. Create apps for each network:
   - **Ethereum Mainnet** (for Week 4 NFT Gallery) - REQUIRED
   - **Sepolia** (for Week 1 & 2) - Optional (has fallback)
   - **Polygon Amoy** (for Week 3) - Optional (has fallback)

### Edit `.env.local`

Replace the placeholder values with your actual API keys:

```env
# Required for Week 4
NEXT_PUBLIC_ALCHEMY_API_KEY=your_mainnet_api_key_here

# Optional (will use defaults if not set)
# NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY=your_sepolia_key_here
# NEXT_PUBLIC_ALCHEMY_POLYGON_AMOY_API_KEY=your_polygon_amoy_key_here
```

### Install and Run

```bash
npm install
npm run dev
```

Visit http://localhost:3000

---

## 2. GitHub Secrets Setup (for GitHub Pages deployment)

### Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

   **Required:**
   - Name: `NEXT_PUBLIC_ALCHEMY_API_KEY`
   - Value: Your Ethereum Mainnet API key (for Week 4)

   **Optional (has fallback defaults):**
   - Name: `NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY`
   - Value: Your Sepolia API key (for Week 1 & 2)
   
   - Name: `NEXT_PUBLIC_ALCHEMY_POLYGON_AMOY_API_KEY`
   - Value: Your Polygon Amoy API key (for Week 3)

### How GitHub Actions Uses Secrets

The `.github/workflows/deploy.yml` workflow automatically:
- Uses secrets during build
- Injects them as environment variables
- Builds your Next.js app with the correct API keys

### After Adding Secrets

Just push to `main` branch - GitHub Actions will automatically build and deploy!

---

## 3. File Status

- ✅ `.env.local` - **NOT committed** (in .gitignore) - for local development
- ✅ `.env.example` - **IS committed** - template for others
- ✅ `.github/workflows/deploy.yml` - Uses GitHub Secrets

---

## Notes

- Weeks 1-3 have **fallback API keys** hardcoded, so they'll work even without environment variables
- Week 4 **requires** `NEXT_PUBLIC_ALCHEMY_API_KEY` to work
- All `NEXT_PUBLIC_*` variables are exposed in client-side code (this is normal for Next.js)
- Never commit `.env.local` or actual API keys to git
