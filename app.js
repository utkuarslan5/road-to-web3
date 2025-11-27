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

const coffeeConfig = {
  contractAddress: "0x86a531F9Fa82E220B28c854C900178c37CFC9ab5",
  chainId: 11155111n,
  chainIdHex: "0xaa36a7",
  chainName: "Sepolia",
  explorer: "https://sepolia.etherscan.io",
  rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/KP7J8NeqBmLe2H7v1waHF",
  defaultAmountEth: "0.001",
};

const coffeeAbi = [
  "function buyCoffee(string name,string message) public payable",
  "function memos() view returns (tuple(address supporter,uint256 timestamp,string name,string message)[])",
  "function owner() view returns (address)",
];

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

const coffeeEls = {
  form: document.getElementById("coffee-form"),
  nameInput: document.getElementById("coffee-name"),
  messageInput: document.getElementById("coffee-message"),
  amountInput: document.getElementById("coffee-amount"),
  connectBtn: document.getElementById("coffee-connect"),
  sendBtn: document.getElementById("coffee-send"),
  status: document.getElementById("coffee-status"),
  memosList: document.getElementById("memos-list"),
  refreshBtn: document.getElementById("coffee-refresh"),
  contractLink: document.getElementById("coffee-contract-link"),
};

const state = {
  rendered: false,
  coffee: {
    readProvider: null,
    readContract: null,
    signer: null,
    contract: null,
    account: "",
  },
};

initTrophy();
initCoffee();

function initTrophy() {
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

function initCoffee() {
  if (!coffeeEls.status) return;

  if (coffeeEls.contractLink) {
    coffeeEls.contractLink.href = `${coffeeConfig.explorer}/address/${coffeeConfig.contractAddress}`;
    coffeeEls.contractLink.textContent = shortenAddress(coffeeConfig.contractAddress);
  }

  setCoffeeStatus(`Contract live on ${coffeeConfig.chainName}. Connect your wallet to send a coffee.`);

  coffeeEls.refreshBtn?.addEventListener("click", refreshMemos);
  coffeeEls.connectBtn?.addEventListener("click", connectCoffeeWallet);
  coffeeEls.form?.addEventListener("submit", handleCoffeeSubmit);

  try {
    ensureEthers();
    state.coffee.readProvider = new ethers.JsonRpcProvider(coffeeConfig.rpcUrl);
    state.coffee.readContract = new ethers.Contract(
      coffeeConfig.contractAddress,
      coffeeAbi,
      state.coffee.readProvider,
    );
    refreshMemos();
  } catch (err) {
    console.error(err);
    setCoffeeStatus(`Unable to load memos: ${extractErrorMessage(err)}`, "error");
  }
}

async function connectCoffeeWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    setCoffeeStatus("No injected wallet detected. Install MetaMask to send a coffee.", "error");
    return;
  }
  ensureEthers();

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const isCorrectNetwork = await ensureCorrectNetwork(provider);
    if (!isCorrectNetwork) return;

    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts?.length) {
      setCoffeeStatus("Wallet connection was rejected.", "error");
      return;
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    state.coffee.signer = signer;
    state.coffee.contract = new ethers.Contract(coffeeConfig.contractAddress, coffeeAbi, signer);
    state.coffee.account = address;

    if (coffeeEls.sendBtn) {
      coffeeEls.sendBtn.disabled = false;
    }
    if (coffeeEls.connectBtn) {
      coffeeEls.connectBtn.textContent = "Wallet connected";
    }

    setCoffeeStatus(`Connected as ${shortenAddress(address)} on ${coffeeConfig.chainName}.`);
  } catch (err) {
    console.error(err);
    setCoffeeStatus(extractErrorMessage(err), "error");
  }
}

async function ensureCorrectNetwork(provider) {
  try {
    const network = await provider.getNetwork();
    if (network?.chainId === coffeeConfig.chainId) return true;

    await provider.send("wallet_switchEthereumChain", [{ chainId: coffeeConfig.chainIdHex }]);
    return true;
  } catch (err) {
    setCoffeeStatus(
      `Switch to ${coffeeConfig.chainName} in your wallet to send a coffee. (${extractErrorMessage(err)})`,
      "error",
    );
    return false;
  }
}

async function handleCoffeeSubmit(event) {
  event.preventDefault();
  if (!state.coffee.contract) {
    await connectCoffeeWallet();
    if (!state.coffee.contract) return;
  }

  const name = (coffeeEls.nameInput?.value || "").trim() || "Anon";
  const message = (coffeeEls.messageInput?.value || "").trim() || "☕️ Thanks!";
  const amountRaw = (coffeeEls.amountInput?.value || coffeeConfig.defaultAmountEth).trim();
  const parsedAmount = safeParseEther(amountRaw || coffeeConfig.defaultAmountEth);

  if (!parsedAmount) {
    setCoffeeStatus("Enter a valid ETH amount.", "error");
    return;
  }
  if (parsedAmount <= 0n) {
    setCoffeeStatus("Amount must be greater than 0.", "error");
    return;
  }

  try {
    if (coffeeEls.sendBtn) {
      coffeeEls.sendBtn.disabled = true;
    }
    setCoffeeStatus("Sending coffee…");
    const tx = await state.coffee.contract.buyCoffee(name, message, { value: parsedAmount });
    setCoffeeStatus("Waiting for confirmation…");
    await tx.wait();
    setCoffeeStatus("Coffee sent! Thanks for the support.", "success");
    if (coffeeEls.sendBtn) {
      coffeeEls.sendBtn.disabled = false;
    }
    coffeeEls.form?.reset();
    if (coffeeEls.amountInput) {
      coffeeEls.amountInput.value = coffeeConfig.defaultAmountEth;
    }
    refreshMemos();
  } catch (err) {
    console.error(err);
    if (coffeeEls.sendBtn) {
      coffeeEls.sendBtn.disabled = false;
    }
    setCoffeeStatus(extractErrorMessage(err), "error");
  }
}

async function refreshMemos() {
  if (!state.coffee.readContract || !coffeeEls.memosList) return;
  try {
    const memos = await state.coffee.readContract.memos();
    renderMemos(memos);
    const allowStatusUpdate = coffeeEls.status?.dataset?.variant !== "success";
    if (allowStatusUpdate) {
      setCoffeeStatus(`Memo board synced from ${coffeeConfig.chainName}.`);
    }
  } catch (err) {
    console.error(err);
    setCoffeeStatus(`Unable to load memos: ${extractErrorMessage(err)}`, "error");
  }
}

function renderMemos(memos) {
  if (!coffeeEls.memosList) return;

  coffeeEls.memosList.innerHTML = "";
  if (!Array.isArray(memos) || memos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "muted";
    empty.textContent = "No memos yet. Be the first to buy a coffee.";
    coffeeEls.memosList.appendChild(empty);
    return;
  }

  [...memos]
    .slice()
    .reverse()
    .forEach((memo) => {
      const item = document.createElement("li");
      item.className = "memo";

      const header = document.createElement("div");
      header.className = "memo__meta";

      const name = document.createElement("strong");
      name.textContent = memo?.name || "Anon";

      const meta = document.createElement("span");
      const time = memo?.timestamp ? formatTimestamp(Number(memo.timestamp)) : "unknown time";
      meta.textContent = `${time} · ${shortenAddress(memo?.supporter)}`;

      const message = document.createElement("p");
      message.className = "memo__message";
      message.textContent = memo?.message || "(no message)";

      header.append(name, meta);
      item.append(header, message);
      coffeeEls.memosList.appendChild(item);
    });
}

function setCoffeeStatus(message, variant = "info") {
  if (!coffeeEls.status) return;
  coffeeEls.status.textContent = message;
  coffeeEls.status.dataset.variant = variant;
}

function shortenAddress(value = "") {
  if (!value || typeof value !== "string" || value.length < 10) return value || "unknown";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "unknown time";
  const date = timestamp instanceof Date ? timestamp : new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return "unknown time";
  return date.toLocaleString(undefined, { month: "short", day: "numeric" });
}

function safeParseEther(value) {
  try {
    ensureEthers();
    return ethers.parseEther(String(value));
  } catch (err) {
    console.warn("Unable to parse ETH amount", err);
    return null;
  }
}

function extractErrorMessage(err) {
  if (!err) return "Unknown error";
  return err.reason || err.message || String(err);
}

function ensureEthers() {
  if (typeof ethers === "undefined") {
    throw new Error("ethers.js failed to load. Refresh and try again.");
  }
}
