const config = {
  rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/KP7J8NeqBmLe2H7v1waHF",
  contractAddress: "0xc84a1D9044Ceb74EC8C17FfD465f1af6Fe0e53DF",
  tokenId: 0,
  callData: "0xc87b56dd0000000000000000000000000000000000000000000000000000000000000000",
  ipfsGateway: "https://ipfs.io/ipfs/",
  ipfsGateways: [
    "https://ipfs.io/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
    "https://nftstorage.link/ipfs/",
    "https://gateway.pinata.cloud/ipfs/",
    "https://cf-ipfs.com/ipfs/",
  ],
  ipfsPathFallbacks: ["metadata.json", "token.json"],
  cacheKey: "utkulabs:trophy",
};

const els = {
  status: document.getElementById("status"),
  mediaSkeleton: document.getElementById("media-skeleton"),
  nftImage: document.getElementById("nft-image"),
  tokenUri: document.getElementById("token-uri"),
  nftName: document.getElementById("nft-name"),
  nftDescription: document.getElementById("nft-description"),
  externalLink: document.getElementById("external-link"),
  attributesSection: document.getElementById("attributes"),
  attributesList: document.getElementById("attributes-list"),
};

const state = {
  rendered: false,
};

init();

function init() {
  const cached = readCache();
  if (cached) {
    renderSnapshot(cached);
    setStatus("Showing cached data, refreshing from RPC…");
  }
  fetchLiveData().catch((err) => {
    console.error(err);
    const metadataFailure = err?.stage === "metadata";
    const message = err?.message ?? String(err);
    if (!cached) {
      setStatus(
        metadataFailure
          ? `tokenURI fetched but metadata is unreachable (${message}).`
          : `Failed to fetch from RPC: ${message}.`,
        "error",
      );
    } else {
      setStatus(
        metadataFailure
          ? `Using cached data. Metadata refresh failed (${message}).`
          : `Using cached data. Refresh to retry RPC fetch (last error: ${message}).`,
        "error",
      );
    }
  });
}

async function fetchLiveData() {
  setStatus("Fetching tokenURI via Alchemy RPC…");
  const rpcPayload = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [
      {
        to: config.contractAddress,
        data: config.callData,
      },
      "latest",
    ],
  };

  const response = await fetch(config.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rpcPayload),
  });

  if (!response.ok) {
    throw new Error(`RPC request failed (${response.status})`);
  }

  const body = await response.json();
  if (!body?.result) {
    throw new Error("RPC response missing result field");
  }

  setStatus("Decoding tokenURI and loading metadata…");
  const tokenUri = decodeAbiString(body.result);
  const metadataSources = buildGatewayUrls(tokenUri);
  const metadataUrl = metadataSources[0] || tokenUri;
  const metadata = await fetchMetadata(metadataSources);

  const snapshot = {
    fetchedAt: Date.now(),
    rpcResult: body.result,
    tokenUri,
    metadataUrl,
    metadata,
  };

  renderSnapshot(snapshot);
  saveCache(snapshot);
  setStatus("Synced trophy data from Sepolia.", "success");
}

function decodeAbiString(hexString) {
  if (!hexString) throw new Error("Empty hex string");
  const hex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  if (hex.length < 128) throw new Error("Hex string too short to contain ABI data");
  const lengthHex = hex.slice(64, 128);
  const length = Number.parseInt(lengthHex, 16);
  const dataHex = hex.slice(128, 128 + length * 2);
  let out = "";
  for (let i = 0; i < dataHex.length; i += 2) {
    const byte = Number.parseInt(dataHex.slice(i, i + 2), 16);
    if (!Number.isNaN(byte)) {
      out += String.fromCharCode(byte);
    }
  }
  return out.trim();
}

function resolveIpfs(uri = "") {
  return buildGatewayUrls(uri)[0] || "";
}

async function fetchMetadata(urls) {
  const attempts = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
  if (!attempts.length) {
    const err = new Error("Missing metadata URL");
    err.stage = "metadata";
    throw err;
  }

  const errors = [];
  for (const url of attempts) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        errors.push(`${url} → HTTP ${res.status}`);
        continue;
      }
      return res.json();
    } catch (err) {
      errors.push(`${url} → ${err.message}`);
    }
  }

  const error = new Error(errors.join(" | ") || "Metadata fetch failed");
  error.stage = "metadata";
  throw error;
}

function renderSnapshot(snapshot) {
  state.rendered = true;
  const { tokenUri, metadata, metadataUrl } = snapshot;

  els.tokenUri.textContent = tokenUri;
  els.tokenUri.href = resolveIpfs(tokenUri);

  els.nftName.textContent = metadata?.name || "Untitled token";
  els.nftDescription.textContent = metadata?.description || "";

  const external = metadata?.external_url || metadataUrl;
  els.externalLink.textContent = external ? readableHostname(external) : "Metadata";
  els.externalLink.href = external || metadataUrl;

  const imageUrl = resolveIpfs(metadata?.image || metadata?.animation_url);
  if (imageUrl) {
    els.nftImage.src = imageUrl;
    els.nftImage.alt = metadata?.name || "NFT media";
    els.nftImage.classList.remove("is-hidden");
  }
  if (els.mediaSkeleton) {
    els.mediaSkeleton.classList.add("is-hidden");
  }

  renderAttributes(metadata?.attributes);
}

function renderAttributes(attributes) {
  if (!Array.isArray(attributes) || attributes.length === 0) {
    els.attributesSection.hidden = true;
    els.attributesList.innerHTML = "";
    return;
  }
  els.attributesSection.hidden = false;
  els.attributesList.innerHTML = "";
  attributes.forEach((attr) => {
    const item = document.createElement("li");
    const trait = attr?.trait_type ?? attr?.trait ?? "Trait";
    const value = attr?.value ?? "—";
    const label = document.createElement("span");
    label.textContent = trait;
    const strong = document.createElement("strong");
    strong.textContent = value;
    item.append(label, strong);
    els.attributesList.appendChild(item);
  });
}

function readableHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (err) {
    return url;
  }
}

function buildGatewayUrls(uri = "") {
  if (!uri) return [];
  if (/^https?:\/\//i.test(uri)) {
    return [uri];
  }
  if (uri.startsWith("ipfs://") || isLikelyCid(uri)) {
    const path = uri.replace(/^ipfs:\/\//i, "").replace(/^\/+/, "");
    const gateways = config.ipfsGateways?.length ? config.ipfsGateways : [config.ipfsGateway];
    const pathVariants = buildIpfsPathVariants(path);
    const urls = [];
    gateways.filter(Boolean).forEach((base) => {
      const normalizedBase = base.replace(/\/$/, "");
      pathVariants.forEach((variant) => {
        urls.push(`${normalizedBase}/${variant}`);
      });
    });
    return Array.from(new Set(urls));
  }
  return [uri];
}

function buildIpfsPathVariants(path = "") {
  if (!path) return [];
  const variants = new Set([path]);
  const cleanPath = path.replace(/^\//, "");
  variants.add(cleanPath);

  const fallbackFiles = config.ipfsPathFallbacks || [];
  fallbackFiles.forEach((file) => {
    if (!file) return;
    variants.add(`${cleanPath}/${file}`);
  });

  if (!/\.json($|\?)/i.test(cleanPath)) {
    variants.add(`${cleanPath}.json`);
  }

  variants.add(`${cleanPath}?filename=metadata.json`);
  variants.add(`${cleanPath}?filename=token.json`);

  return Array.from(variants);
}

function isLikelyCid(value = "") {
  if (!value) return false;
  if (value.startsWith("ipfs://")) return true;
  // CIDv0 starts with Qm, CIDv1 (base32) starts with bafy...
  return /^(?:Qm[1-9A-HJ-NP-Za-km-z]{44,}|bafy[0-9a-z]{50,})$/i.test(value);
}

function setStatus(message, variant = "info") {
  if (!els.status) return;
  els.status.textContent = message;
  els.status.dataset.variant = variant;
}

function saveCache(snapshot) {
  try {
    localStorage.setItem(config.cacheKey, JSON.stringify(snapshot));
  } catch (err) {
    console.warn("Unable to persist cache", err);
  }
}

function readCache() {
  try {
    const raw = localStorage.getItem(config.cacheKey);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to parse cache", err);
    return null;
  }
}
