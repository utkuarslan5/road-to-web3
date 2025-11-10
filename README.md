# utkulabs Sepolia NFT Viewer

Live “trophy” page for the LabMint ERC-721 deployment on Sepolia. On every load it replays the exact `eth_call` against Alchemy, decodes the tokenURI for token #0, resolves the IPFS metadata, and caches the snapshot in the browser for fast re-visits.

## Contract + Network

| Item | Value |
| --- | --- |
| Network | Sepolia (chain id 11155111) |
| RPC | `https://eth-sepolia.g.alchemy.com/v2/KP7J8NeqBmLe2H7v1waHF` |
| Contract | `0xc84a****53DF` (masked) |
| Method showcased | `tokenURI(0)` decoded from `eth_call` |

## Features

- Automatically POSTs to the Alchemy Sepolia RPC, decodes the ABI string result, and loads metadata/images via an IPFS gateway.
- Trophy layout with hero callouts, NFT media, attribute grid, and a polished facts panel summarizing the contract.
- LocalStorage cache so the last successful snapshot renders instantly while a fresh RPC call runs in the background.
- Multi-gateway IPFS fallback (ipfs.io, Cloudflare, nftstorage.link, Pinata, cf-ipfs) plus path heuristics (`metadata.json`, `token.json`, `?filename=`) so metadata loads even if a gateway changes its routing.

## Usage

1. Serve the folder locally or open `index.html` directly in any modern browser.
2. The app immediately reaches out to Alchemy, decodes the result, and renders the NFT once metadata is fetched.
3. Re-open the page later to see the cached state while the background refresh runs.

> Only read-only RPC calls are made; no wallets, signatures, or private data are involved.

## Deploying to GitHub Pages

1. Push the files in this repo to `utkulabs/sepolia-nft-viewer` (public).
2. Enable GitHub Pages → **Deploy from branch** → `main` → `/ (root)`.
3. The site will be available at `https://utkulabs.github.io/sepolia-nft-viewer/`.

Optional extras:

- Add a `CNAME` file with `viewer.utkulabs.xyz` if you plan to use the vanity domain.
- Drop a `robots.txt` file alongside `index.html` to opt-out of search indexing.

## Maintenance

- Update `index.html`, `styles.css`, or `app.js`, commit, and push — Pages redeploys automatically.
- To showcase a different token/function, adjust the constants at the top of `app.js` and redeploy.

## Local development tips

- Use a simple static server for live reload, e.g. `npx serve` or `python -m http.server`.
- Open your browser devtools console to inspect RPC responses or metadata payloads.
