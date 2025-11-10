# utkulabs Sepolia NFT Viewer

Static, read-only explorer for the LabMint ERC-721 contract on the Sepolia testnet. The page speaks directly to an Alchemy RPC endpoint, pulls metadata via `tokenURI`, resolves IPFS assets, and renders everything in a GitHub Pages-friendly layout.

## Contract + Network

| Item | Value |
| --- | --- |
| Network | Sepolia (chain id 11155111) |
| RPC | `https://eth-sepolia.g.alchemy.com/v2/KP7J8NeqBmLe2H7v1waHF` |
| Contract | `0xc84a1D9044Ceb74EC8C17FfD465f1af6Fe0e53DF` |
| Interface | `name()`, `symbol()`, `ownerOf(uint256)`, `tokenURI(uint256)` |

## Features

- Hardcoded to the utkulabs LabMint contract — just enter a token ID.
- Resolves `tokenURI` metadata, shows image/video, description, attributes + raw JSON.
- Owner + tokenURI links jump out to Etherscan/IPFS.
- Prefill token via query string (`?tid=5`) for quick sharing.
- Pure HTML/CSS/JS + [ethers.js v6.13](https://docs.ethers.org) — safe for static hosting.

## Usage

1. Serve the folder locally or open `index.html` directly in any modern browser.
2. (Optional) Append `?tid=<id>` to the URL so the viewer loads a token on arrival.
3. Enter a token ID and click **Fetch token data**. Metadata is fetched live from Alchemy.

> No private keys or write transactions are involved; this viewer performs read-only RPC calls.

## Deploying to GitHub Pages

1. Push the files in this repo to `utkulabs/sepolia-nft-viewer` (public).
2. Enable GitHub Pages → **Deploy from branch** → `main` → `/ (root)`.
3. The site will be available at `https://utkulabs.github.io/sepolia-nft-viewer/`.

Optional extras:

- Add a `CNAME` file with `viewer.utkulabs.xyz` if you plan to use the vanity domain.
- Drop a `robots.txt` file alongside `index.html` to opt-out of search indexing.

## Maintenance

- Update `index.html`, `styles.css`, or `app.js`, commit, and push — Pages redeploys automatically.
- If the contract/RPC ever change, edit the constants at the top of `app.js`.

## Local development tips

- Use a simple static server for live reload, e.g. `npx serve` or `python -m http.server`.
- Open your browser devtools console to inspect RPC responses or metadata payloads.
