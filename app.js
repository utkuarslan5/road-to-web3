const config = {
  rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/KP7J8NeqBmLe2H7v1waHF",
  contractAddress: "0xc84a1D9044Ceb74EC8C17FfD465f1af6Fe0e53DF",
  ipfsGateway: "https://ipfs.io/ipfs/",
  maskedContract: "0xc84a****53DF",
  prefetchTokenIds: [0, 1, 2, 3],
};

const els = {
  form: document.getElementById("token-form"),
  tokenInput: document.getElementById("token-id"),
  status: document.getElementById("status"),
  owner: document.getElementById("owner"),
  tokenUri: document.getElementById("token-uri"),
  media: document.getElementById("nft-media"),
  title: document.getElementById("nft-title"),
  description: document.getElementById("nft-description"),
  contractName: document.getElementById("contract-name"),
  contractSymbol: document.getElementById("contract-symbol"),
  tokenIdLabel: document.getElementById("token-id-label"),
  attributes: document.getElementById("attributes"),
  attributeList: document.getElementById("attribute-list"),
  metadataJson: document.getElementById("metadata-json"),
  mintedStatus: document.getElementById("minted-status"),
  mintedGrid: document.getElementById("minted-grid"),
};

const state = {
  mintedTokens: [],
};

const abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const contract = new ethers.Contract(config.contractAddress, abi, provider);

async function init() {
  wireEvents();
  await primeContractDetails();
  prefetchMintedTokens();
  const preset = new URLSearchParams(window.location.search).get("tid");
  if (preset) {
    els.tokenInput.value = preset;
    fetchAndRenderToken(parseInt(preset, 10));
  }
}

function wireEvents() {
  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const tokenId = parseInt(els.tokenInput.value, 10);
    if (Number.isNaN(tokenId) || tokenId < 0) {
      setStatus("Provide a valid token ID (>= 0).", "error");
      return;
    }
    fetchAndRenderToken(tokenId);
  });
}

async function primeContractDetails() {
  try {
    setStatus("Syncing contract metadata…");
    const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);
    els.contractName.textContent = name;
    els.contractSymbol.textContent = symbol;
    setStatus("Contract metadata loaded. Enter a token ID to query owner/tokenURI.");
  } catch (err) {
    console.error(err);
    setStatus("Unable to load name/symbol from the contract. RPC available?", "error");
  }
}

async function fetchAndRenderToken(tokenId) {
  setStatus(`Querying token #${tokenId}…`);
  toggleForm(true);
  try {
    const token = await loadTokenData(tokenId);
    renderToken(token);
    updateUrlParam(tokenId);
    setStatus("Token loaded successfully.", "success");
  } catch (err) {
    console.error(err);
    setStatus(parseRpcError(err), "error");
    clearRender();
  } finally {
    toggleForm(false);
  }
}

async function loadTokenData(tokenId) {
  const [owner, tokenUri] = await Promise.all([
    contract.ownerOf(tokenId),
    contract.tokenURI(tokenId),
  ]);

  const resolvedUri = resolveIpfs(tokenUri);
  const metadata = await fetchMetadata(resolvedUri);

  return { tokenId, owner, tokenUri: resolvedUri, rawUri: tokenUri, metadata };
}

function toggleForm(disabled) {
  els.tokenInput.disabled = disabled;
  els.form.querySelector("button[type=submit]").disabled = disabled;
}

function parseRpcError(err) {
  const message = err?.info?.error?.message || err?.shortMessage || err?.message || String(err);
  if (/ERC721: invalid token ID/i.test(message)) {
    return "Token does not exist (ERC721: invalid token ID).";
  }
  return `Failed to load token. ${message}`;
}

function isInvalidTokenError(err) {
  const message = err?.info?.error?.message || err?.shortMessage || err?.message || String(err);
  return /ERC721: invalid token ID/i.test(message);
}

function resolveIpfs(uri) {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    const path = uri.replace("ipfs://", "");
    return new URL(path, config.ipfsGateway).toString();
  }
  if (uri.startsWith("https://ipfs.io/ipfs/")) {
    return uri;
  }
  return uri;
}

async function fetchMetadata(uri) {
  if (!uri) {
    throw new Error("tokenURI returned empty string");
  }
  const response = await fetch(uri, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Metadata fetch failed (${response.status})`);
  }
  return response.json();
}

function renderToken({ tokenId, owner, tokenUri, rawUri, metadata }) {
  els.owner.textContent = owner;
  els.owner.href = `https://sepolia.etherscan.io/address/${owner}`;
  els.owner.target = "_blank";
  els.owner.rel = "noreferrer";

  els.tokenUri.textContent = rawUri;
  els.tokenUri.href = tokenUri;

  els.tokenIdLabel.textContent = tokenId;
  els.title.textContent = metadata?.name || `Token #${tokenId}`;
  els.description.textContent = metadata?.description || "";

  renderMedia(metadata);
  renderAttributes(metadata?.attributes);
  els.metadataJson.textContent = JSON.stringify(metadata ?? {}, null, 2);
}

function renderMedia(metadata = {}) {
  const mediaUrl = resolveIpfs(metadata.image) || resolveIpfs(metadata.animation_url);
  els.media.innerHTML = "";
  if (!mediaUrl) {
    els.media.innerHTML = "<span>No media referenced in metadata.</span>";
    return;
  }

  if (/\.mp4$|\.webm$|\.mov$/i.test(mediaUrl)) {
    const video = document.createElement("video");
    video.src = mediaUrl;
    video.controls = true;
    video.autoplay = false;
    els.media.appendChild(video);
    return;
  }

  const img = document.createElement("img");
  img.src = mediaUrl;
  img.alt = metadata?.name || "NFT media";
  img.loading = "lazy";
  els.media.appendChild(img);
}

function renderAttributes(attrs) {
  if (!Array.isArray(attrs) || attrs.length === 0) {
    els.attributes.hidden = true;
    els.attributeList.innerHTML = "";
    return;
  }
  els.attributes.hidden = false;
  els.attributeList.innerHTML = "";
  attrs.forEach((attr) => {
    const item = document.createElement("li");
    const trait = attr?.trait_type ?? attr?.trait ?? "Trait";
    const value = attr?.value ?? "—";
    item.textContent = `${trait}: ${value}`;
    els.attributeList.appendChild(item);
  });
}

function clearRender() {
  els.owner.textContent = "—";
  els.owner.removeAttribute("href");
  els.tokenUri.textContent = "—";
  els.tokenUri.removeAttribute("href");
  els.tokenIdLabel.textContent = "—";
  els.title.textContent = "Waiting for token…";
  els.description.textContent = "";
  els.media.innerHTML = "<span>No media loaded</span>";
  els.attributeList.innerHTML = "";
  els.attributes.hidden = true;
  els.metadataJson.textContent = "{}";
}

function setStatus(message, variant = "info") {
  els.status.textContent = message;
  els.status.dataset.variant = variant;
}

function updateUrlParam(tokenId) {
  const url = new URL(window.location.href);
  url.searchParams.set("tid", tokenId);
  window.history.replaceState({}, "", url);
}

async function prefetchMintedTokens() {
  els.mintedStatus.textContent = "Prefetching minted tokens…";
  els.mintedStatus.dataset.variant = "info";
  els.mintedGrid.hidden = true;
  els.mintedGrid.innerHTML = "";

  const minted = [];
  for (const tokenId of config.prefetchTokenIds) {
    try {
      const token = await loadTokenData(tokenId);
      minted.push(token);
    } catch (err) {
      if (isInvalidTokenError(err)) {
        continue;
      }
      console.error(`Prefetch failed for token #${tokenId}`, err);
    }
  }

  state.mintedTokens = minted;
  if (!minted.length) {
    els.mintedStatus.textContent = "No minted tokens returned in the prefetched range yet.";
    els.mintedStatus.dataset.variant = "error";
    return;
  }

  els.mintedStatus.textContent = `Loaded ${minted.length} minted token${minted.length > 1 ? "s" : ""}.`;
  els.mintedStatus.dataset.variant = "success";
  els.mintedGrid.hidden = false;
  minted
    .sort((a, b) => a.tokenId - b.tokenId)
    .forEach((token) => {
      els.mintedGrid.appendChild(buildMintedCard(token));
    });
}

function buildMintedCard(token) {
  const card = document.createElement("article");
  card.className = "minted-card";

  const mediaWrapper = document.createElement("div");
  mediaWrapper.className = "minted-card__media";
  const mediaUrl = resolveIpfs(token.metadata?.image) || resolveIpfs(token.metadata?.animation_url);
  if (mediaUrl) {
    const img = document.createElement("img");
    img.src = mediaUrl;
    img.alt = token.metadata?.name || `Token #${token.tokenId}`;
    img.loading = "lazy";
    mediaWrapper.appendChild(img);
  } else {
    const placeholder = document.createElement("span");
    placeholder.textContent = "No media";
    mediaWrapper.appendChild(placeholder);
  }

  const body = document.createElement("div");
  body.className = "minted-card__body";

  const label = document.createElement("p");
  label.className = "label";
  label.textContent = `Token #${token.tokenId}`;

  const title = document.createElement("h3");
  title.textContent = token.metadata?.name || `Token #${token.tokenId}`;

  const desc = document.createElement("p");
  desc.className = "muted";
  desc.textContent = token.metadata?.description || "";

  const meta = document.createElement("div");
  meta.className = "minted-card__meta";
  const owner = document.createElement("span");
  owner.textContent = truncateAddress(token.owner);
  const uriLink = document.createElement("a");
  uriLink.href = token.tokenUri;
  uriLink.target = "_blank";
  uriLink.rel = "noreferrer";
  uriLink.textContent = "Metadata ↗";
  meta.append(owner, uriLink);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn ghost small";
  button.textContent = "View details";
  button.addEventListener("click", () => {
    renderToken(token);
    updateUrlParam(token.tokenId);
    setStatus(`Viewing prefetched token #${token.tokenId}.`, "success");
  });

  body.append(label, title, desc, meta, button);
  card.append(mediaWrapper, body);
  return card;
}

function truncateAddress(address = "") {
  if (!address) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

init();
