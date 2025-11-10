const config = {
  rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/KP7J8NeqBmLe2H7v1waHF",
  contractAddress: "0xc84a1D9044Ceb74EC8C17FfD465f1af6Fe0e53DF",
  tokenId: 0,
  callData: "0xc87b56dd0000000000000000000000000000000000000000000000000000000000000000",
  ipfsGateway: "https://ipfs.io/ipfs/",
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
  metadataJson: document.getElementById("metadata-json"),
  metadataLink: document.getElementById("metadata-link"),
  rpcResult: document.getElementById("rpc-result"),
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
    if (!cached) {
      setStatus("Failed to fetch from RPC. Please refresh to try again.", "error");
    } else {
      setStatus("Using cached data. Refresh to retry RPC fetch.", "error");
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
  const metadataUrl = resolveIpfs(tokenUri);
  const metadata = await fetchMetadata(metadataUrl);

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
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return `${config.ipfsGateway}${uri.replace("ipfs://", "")}`;
  }
  return uri;
}

async function fetchMetadata(url) {
  if (!url) throw new Error("Missing metadata URL");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Metadata fetch failed (${res.status})`);
  }
  return res.json();
}

function renderSnapshot(snapshot) {
  state.rendered = true;
  const { tokenUri, metadata, metadataUrl, rpcResult } = snapshot;

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

  els.metadataJson.textContent = JSON.stringify(metadata ?? {}, null, 2);
  els.metadataLink.href = metadataUrl || "#";

  els.rpcResult.textContent = formatRpcResult(rpcResult);
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

function formatRpcResult(result) {
  if (!result) return "(no result)";
  return `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "${chunkHex(result)}"
}`;
}

function chunkHex(hex) {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const segments = clean.match(/.{1,64}/g) || [];
  return `0x${segments.join("\\n")}`;
}

function readableHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (err) {
    return url;
  }
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
