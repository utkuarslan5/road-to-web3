// Configuration for Week 1 - LabMint Trophy
const week1Config = {
  rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/KP7J8NeqBmLe2H7v1waHF",
  contractAddress: "0xc84a1D9044Ceb74EC8C17FfD465f1af6Fe0e53DF",
  tokenId: 0,
  callData: "0xc87b56dd0000000000000000000000000000000000000000000000000000000000000000",
  ipfsGateways: [
    "https://ipfs.io/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
    "https://nftstorage.link/ipfs/",
    "https://gateway.pinata.cloud/ipfs/",
  ],
  cacheKey: "utkulabs:week1:trophy",
};

// Configuration for Week 2 - Buy Me a Coffee
const week2Config = {
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
];

// Configuration for Week 3 - Chain Battles
const week3Config = {
  // NOTE: Replace with actual deployed contract address
  contractAddress: "0xa19CE93621c003747b58ab98FaD7b419A6C596d4", // Placeholder - deploy contract first
  chainId: 80002n, // Polygon Amoy
  chainIdHex: "0x13882",
  chainName: "Polygon Amoy",
  explorer: "https://amoy.polygonscan.com",
  rpcUrl: "https://polygon-amoy.g.alchemy.com/v2/TkrgpEOpu3jxDokxXlWBg",
  cooldownSeconds: 60,
};

const chainBattlesAbi = [
  "function mint() external",
  "function train(uint256 tokenId) external",
  "function battle(uint256 attackerId, uint256 defenderId) external returns (bool)",
  "function statsOf(uint256 tokenId) external view returns (tuple(uint48 lastAction, uint16 level, uint16 power, uint16 agility, uint16 vitality, uint32 victories, uint32 defeats, uint8 rarity))",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
];

// DOM Elements
const week1Els = {
  skeleton: document.getElementById("w1-skeleton"),
  image: document.getElementById("w1-nft-image"),
  name: document.getElementById("w1-nft-name"),
  description: document.getElementById("w1-nft-description"),
  status: document.getElementById("w1-status"),
};

const week2Els = {
  form: document.getElementById("coffee-form"),
  nameInput: document.getElementById("coffee-name"),
  messageInput: document.getElementById("coffee-message"),
  amountInput: document.getElementById("coffee-amount"),
  connectBtn: document.getElementById("coffee-connect"),
  sendBtn: document.getElementById("coffee-send"),
  status: document.getElementById("coffee-status"),
  memosList: document.getElementById("memos-list"),
  refreshBtn: document.getElementById("coffee-refresh"),
};

const week3Els = {
  skeleton: document.getElementById("w3-skeleton"),
  image: document.getElementById("w3-nft-image"),
  connectBtn: document.getElementById("w3-connect"),
  mintBtn: document.getElementById("w3-mint"),
  trainBtn: document.getElementById("w3-train"),
  viewBtn: document.getElementById("w3-view"),
  tokenInput: document.getElementById("w3-token-input"),
  status: document.getElementById("w3-status"),
  level: document.getElementById("w3-level"),
  rarity: document.getElementById("w3-rarity"),
  power: document.getElementById("w3-power"),
  agility: document.getElementById("w3-agility"),
  vitality: document.getElementById("w3-vitality"),
  record: document.getElementById("w3-record"),
  cooldown: document.getElementById("w3-cooldown"),
  contractLink: document.getElementById("w3-contract-link"),
};

// State management
const state = {
  week2: {
    readProvider: null,
    readContract: null,
    signer: null,
    contract: null,
    account: "",
    connecting: false,
  },
  week3: {
    readProvider: null,
    readContract: null,
    signer: null,
    contract: null,
    account: "",
    connecting: false,
    currentTokenId: null,
    userTokenIds: [],
  },
};

// ============================================
// WEEK 1: LabMint Trophy
// ============================================

async function initWeek1() {
  setStatus(week1Els.status, "Fetching NFT from Sepolia...", "info");

  const cached = readCache(week1Config.cacheKey);
  if (cached) {
    renderWeek1NFT(cached);
    setStatus(week1Els.status, "Showing cached data, refreshing...", "info");
  }

  try {
    const response = await fetch(week1Config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          {
            to: week1Config.contractAddress,
            data: week1Config.callData,
          },
          "latest",
        ],
      }),
    });

    const body = await response.json();
    if (!body?.result) throw new Error("No result from RPC");

    const tokenUri = decodeAbiString(body.result);
    const metadata = await fetchMetadata(buildGatewayUrls(tokenUri));

    const snapshot = {
      fetchedAt: Date.now(),
      tokenUri,
      metadata,
    };

    renderWeek1NFT(snapshot);
    saveCache(week1Config.cacheKey, snapshot);
    setStatus(week1Els.status, "NFT loaded from Sepolia", "success");
  } catch (err) {
    console.error(err);
    if (!cached) {
      setStatus(week1Els.status, `Failed to load NFT: ${err.message}`, "error");
    } else {
      setStatus(week1Els.status, "Using cached data (refresh failed)", "error");
    }
  }
}

function renderWeek1NFT(snapshot) {
  const { metadata } = snapshot;

  week1Els.name.textContent = metadata?.name || "Untitled NFT";
  week1Els.description.textContent = metadata?.description || "";

  const imageUrl = resolveIpfs(metadata?.image || metadata?.animation_url);
  if (imageUrl) {
    week1Els.image.src = imageUrl;
    week1Els.image.alt = metadata?.name || "NFT";
    week1Els.image.classList.remove("is-hidden");
  }

  if (week1Els.skeleton) {
    week1Els.skeleton.classList.add("is-hidden");
  }
}

// ============================================
// WEEK 2: Buy Me a Coffee
// ============================================

async function initWeek2() {
  setStatus(week2Els.status, "Connect your wallet to send a coffee", "info");

  week2Els.connectBtn?.addEventListener("click", connectWeek2Wallet);
  week2Els.refreshBtn?.addEventListener("click", refreshMemos);
  week2Els.form?.addEventListener("submit", handleCoffeeSend);

  try {
    ensureEthers();
    state.week2.readProvider = new ethers.JsonRpcProvider(week2Config.rpcUrl);
    state.week2.readContract = new ethers.Contract(
      week2Config.contractAddress,
      coffeeAbi,
      state.week2.readProvider
    );
    await refreshMemos();
  } catch (err) {
    console.error(err);
    setStatus(week2Els.status, `Unable to load memos: ${err.message}`, "error");
  }
}

async function connectWeek2Wallet() {
  if (state.week2.connecting) {
    setStatus(week2Els.status, "Connection pending in your wallet", "error");
    return;
  }

  state.week2.connecting = true;

  if (!window.ethereum) {
    setStatus(week2Els.status, "Install MetaMask to send a coffee", "error");
    state.week2.connecting = false;
    return;
  }

  ensureEthers();

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await ensureCorrectNetwork(provider, week2Config);

    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts?.length) {
      setStatus(week2Els.status, "Wallet connection rejected", "error");
      return;
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    state.week2.signer = signer;
    state.week2.contract = new ethers.Contract(
      week2Config.contractAddress,
      coffeeAbi,
      signer
    );
    state.week2.account = address;

    if (week2Els.sendBtn) week2Els.sendBtn.disabled = false;
    if (week2Els.connectBtn) week2Els.connectBtn.textContent = "✓ Connected";

    setStatus(week2Els.status, `Connected: ${shortenAddress(address)}`, "success");
  } catch (err) {
    console.error(err);
    setStatus(week2Els.status, extractErrorMessage(err), "error");
  } finally {
    state.week2.connecting = false;
  }
}

async function handleCoffeeSend(event) {
  event.preventDefault();

  if (!state.week2.contract) {
    await connectWeek2Wallet();
    if (!state.week2.contract) return;
  }

  const name = (week2Els.nameInput?.value || "").trim() || "Anonymous";
  const message = (week2Els.messageInput?.value || "").trim() || "Thanks!";
  const amount = week2Els.amountInput?.value || week2Config.defaultAmountEth;

  const parsedAmount = safeParseEther(amount);
  if (!parsedAmount || parsedAmount <= 0n) {
    setStatus(week2Els.status, "Invalid amount", "error");
    return;
  }

  try {
    if (week2Els.sendBtn) week2Els.sendBtn.disabled = true;
    setStatus(week2Els.status, "Sending coffee...", "info");

    const tx = await state.week2.contract.buyCoffee(name, message, {
      value: parsedAmount,
    });

    setStatus(week2Els.status, "Waiting for confirmation...", "info");
    await tx.wait();

    setStatus(week2Els.status, "Coffee sent! Thanks for supporting 🎉", "success");

    if (week2Els.sendBtn) week2Els.sendBtn.disabled = false;
    week2Els.form?.reset();
    if (week2Els.amountInput) week2Els.amountInput.value = week2Config.defaultAmountEth;

    await refreshMemos();
  } catch (err) {
    console.error(err);
    if (week2Els.sendBtn) week2Els.sendBtn.disabled = false;
    setStatus(week2Els.status, extractErrorMessage(err), "error");
  }
}

async function refreshMemos() {
  if (!state.week2.readContract) return;

  try {
    const memos = await state.week2.readContract.memos();
    renderMemos(memos);
  } catch (err) {
    console.error(err);
  }
}

function renderMemos(memos) {
  if (!week2Els.memosList) return;

  week2Els.memosList.innerHTML = "";

  if (!Array.isArray(memos) || memos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "memo-empty";
    empty.textContent = "No memos yet. Be the first!";
    week2Els.memosList.appendChild(empty);
    return;
  }

  [...memos].reverse().forEach((memo) => {
    const item = document.createElement("li");
    item.className = "memo-item";

    const header = document.createElement("div");
    header.className = "memo-header";

    const name = document.createElement("strong");
    name.textContent = memo?.name || "Anonymous";

    const meta = document.createElement("span");
    meta.className = "memo-meta";
    const time = memo?.timestamp ? formatTimestamp(Number(memo.timestamp)) : "unknown";
    meta.textContent = `${time} · ${shortenAddress(memo?.supporter)}`;

    const message = document.createElement("p");
    message.className = "memo-message";
    message.textContent = memo?.message || "(no message)";

    header.append(name, meta);
    item.append(header, message);
    week2Els.memosList.appendChild(item);
  });
}

// ============================================
// WEEK 3: Chain Battles
// ============================================

async function initWeek3() {
  // Update contract link
  if (week3Els.contractLink && week3Config.contractAddress !== "0x0000000000000000000000000000000000000000") {
    week3Els.contractLink.href = `${week3Config.explorer}/address/${week3Config.contractAddress}`;
    week3Els.contractLink.textContent = shortenAddress(week3Config.contractAddress);
  }

  setStatus(week3Els.status, "Connect wallet to interact with Chain Battles", "info");

  week3Els.connectBtn?.addEventListener("click", connectWeek3Wallet);
  week3Els.mintBtn?.addEventListener("click", mintWarrior);
  week3Els.trainBtn?.addEventListener("click", trainWarrior);
  week3Els.viewBtn?.addEventListener("click", viewTokenById);

  // Initialize read provider for viewing NFTs
  try {
    ensureEthers();
    state.week3.readProvider = new ethers.JsonRpcProvider(week3Config.rpcUrl);
    state.week3.readContract = new ethers.Contract(
      week3Config.contractAddress,
      chainBattlesAbi,
      state.week3.readProvider
    );
  } catch (err) {
    console.error(err);
  }
}

async function connectWeek3Wallet() {
  if (state.week3.connecting) {
    setStatus(week3Els.status, "Connection pending in your wallet", "error");
    return;
  }

  state.week3.connecting = true;

  if (!window.ethereum) {
    setStatus(week3Els.status, "Install MetaMask to interact", "error");
    state.week3.connecting = false;
    return;
  }

  ensureEthers();

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await ensureCorrectNetwork(provider, week3Config);

    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts?.length) {
      setStatus(week3Els.status, "Wallet connection rejected", "error");
      return;
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    state.week3.signer = signer;
    state.week3.contract = new ethers.Contract(
      week3Config.contractAddress,
      chainBattlesAbi,
      signer
    );
    state.week3.account = address;

    // Enable buttons
    if (week3Els.mintBtn) week3Els.mintBtn.disabled = false;
    if (week3Els.viewBtn) week3Els.viewBtn.disabled = false;
    if (week3Els.connectBtn) week3Els.connectBtn.textContent = "✓ Connected";

    setStatus(week3Els.status, `Connected: ${shortenAddress(address)}`, "success");

    // Check if user has any NFTs
    await loadUserNFTs(address);
  } catch (err) {
    console.error(err);
    setStatus(week3Els.status, extractErrorMessage(err), "error");
  } finally {
    state.week3.connecting = false;
  }
}

async function loadUserNFTs(address) {
  if (!state.week3.readContract) return;

  try {
    const balance = await state.week3.readContract.balanceOf(address);
    if (balance > 0) {
      // For simplicity, we'll just enable train button
      // In a real app, you'd query all token IDs owned by the user
      if (week3Els.trainBtn) week3Els.trainBtn.disabled = false;
    }
  } catch (err) {
    console.error("Error loading user NFTs:", err);
  }
}

async function mintWarrior() {
  if (!state.week3.contract) {
    setStatus(week3Els.status, "Connect wallet first", "error");
    return;
  }

  try {
    if (week3Els.mintBtn) week3Els.mintBtn.disabled = true;
    setStatus(week3Els.status, "Minting warrior...", "info");

    const tx = await state.week3.contract.mint();
    setStatus(week3Els.status, "Waiting for confirmation...", "info");
    const receipt = await tx.wait();

    // Try to get the token ID from the event
    // ERC721 Transfer event: Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
    const transferEvent = receipt.logs.find((log) => {
      try {
        const parsed = state.week3.contract.interface.parseLog(log);
        return parsed?.name === "Transfer";
      } catch {
        return false;
      }
    });

    let tokenId = null;
    if (transferEvent) {
      const parsed = state.week3.contract.interface.parseLog(transferEvent);
      tokenId = parsed.args[2]; // tokenId is the third argument
    }

    setStatus(week3Els.status, `Warrior minted! ${tokenId ? `Token ID: ${tokenId}` : ""}`, "success");

    if (tokenId) {
      state.week3.currentTokenId = Number(tokenId);
      await loadTokenData(Number(tokenId));
    }

    if (week3Els.mintBtn) week3Els.mintBtn.disabled = false;
    if (week3Els.trainBtn) week3Els.trainBtn.disabled = false;
  } catch (err) {
    console.error(err);
    if (week3Els.mintBtn) week3Els.mintBtn.disabled = false;
    setStatus(week3Els.status, extractErrorMessage(err), "error");
  }
}

async function trainWarrior() {
  if (!state.week3.contract) {
    setStatus(week3Els.status, "Connect wallet first", "error");
    return;
  }

  const tokenId = state.week3.currentTokenId || Number(week3Els.tokenInput?.value);
  if (!tokenId) {
    setStatus(week3Els.status, "No token ID selected", "error");
    return;
  }

  try {
    if (week3Els.trainBtn) week3Els.trainBtn.disabled = true;
    setStatus(week3Els.status, "Training warrior...", "info");

    const tx = await state.week3.contract.train(tokenId);
    setStatus(week3Els.status, "Waiting for confirmation...", "info");
    await tx.wait();

    setStatus(week3Els.status, "Warrior trained successfully! 💪", "success");

    // Reload the token data
    await loadTokenData(tokenId);

    if (week3Els.trainBtn) week3Els.trainBtn.disabled = false;
  } catch (err) {
    console.error(err);
    if (week3Els.trainBtn) week3Els.trainBtn.disabled = false;

    // Check if it's a cooldown error
    if (err.message?.includes("Cooldown")) {
      setStatus(week3Els.status, "Warrior is on cooldown. Wait 60 seconds.", "error");
    } else {
      setStatus(week3Els.status, extractErrorMessage(err), "error");
    }
  }
}

async function viewTokenById() {
  const tokenId = Number(week3Els.tokenInput?.value);
  if (!tokenId || tokenId < 1) {
    setStatus(week3Els.status, "Enter a valid token ID", "error");
    return;
  }

  await loadTokenData(tokenId);
}

async function loadTokenData(tokenId) {
  if (!state.week3.readContract) {
    setStatus(week3Els.status, "Contract not initialized", "error");
    return;
  }

  try {
    setStatus(week3Els.status, `Loading warrior #${tokenId}...`, "info");

    // Get stats
    const stats = await state.week3.readContract.statsOf(tokenId);
    const tokenURI = await state.week3.readContract.tokenURI(tokenId);

    // Update state
    state.week3.currentTokenId = tokenId;

    // Parse stats
    const rarityLabels = ["Common", "Uncommon", "Rare", "Epic", "Mythic"];
    const rarity = rarityLabels[stats.rarity] || "Unknown";

    // Update UI
    if (week3Els.level) week3Els.level.textContent = stats.level.toString();
    if (week3Els.rarity) week3Els.rarity.textContent = rarity;
    if (week3Els.power) week3Els.power.textContent = stats.power.toString();
    if (week3Els.agility) week3Els.agility.textContent = stats.agility.toString();
    if (week3Els.vitality) week3Els.vitality.textContent = stats.vitality.toString();
    if (week3Els.record) {
      week3Els.record.textContent = `${stats.victories} / ${stats.defeats}`;
    }

    // Calculate cooldown
    const now = Math.floor(Date.now() / 1000);
    const lastAction = Number(stats.lastAction);
    const cooldownEnd = lastAction + week3Config.cooldownSeconds;
    const remaining = Math.max(0, cooldownEnd - now);

    if (week3Els.cooldown) {
      if (remaining > 0) {
        week3Els.cooldown.textContent = `Cooldown: ${remaining}s remaining`;
      } else {
        week3Els.cooldown.textContent = "Ready to train!";
      }
    }

    // Load image from tokenURI (it's a data URI)
    if (tokenURI.startsWith("data:application/json")) {
      const json = JSON.parse(atob(tokenURI.split(",")[1]));
      if (json.image && week3Els.image) {
        week3Els.image.src = json.image;
        week3Els.image.classList.remove("is-hidden");
        if (week3Els.skeleton) week3Els.skeleton.classList.add("is-hidden");
      }
    }

    setStatus(week3Els.status, `Warrior #${tokenId} loaded`, "success");

    // Enable train button if connected and owner
    if (state.week3.contract && remaining === 0) {
      const owner = await state.week3.readContract.ownerOf(tokenId);
      if (owner.toLowerCase() === state.week3.account.toLowerCase()) {
        if (week3Els.trainBtn) week3Els.trainBtn.disabled = false;
      }
    }
  } catch (err) {
    console.error(err);
    setStatus(week3Els.status, `Failed to load token: ${extractErrorMessage(err)}`, "error");
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function decodeAbiString(hexString) {
  if (!hexString) throw new Error("Empty hex string");
  const hex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  if (hex.length < 128) throw new Error("Hex string too short");

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
  const urls = buildGatewayUrls(uri);
  return urls[0] || "";
}

function buildGatewayUrls(uri = "") {
  if (!uri) return [];
  if (/^https?:\/\//i.test(uri)) return [uri];

  if (uri.startsWith("ipfs://") || isLikelyCid(uri)) {
    const path = uri.replace(/^ipfs:\/\//i, "").replace(/^\/+/, "");
    return week1Config.ipfsGateways.map((gateway) => `${gateway}${path}`);
  }

  return [uri];
}

function isLikelyCid(value = "") {
  if (!value) return false;
  if (value.startsWith("ipfs://")) return true;
  return /^(?:Qm[1-9A-HJ-NP-Za-km-z]{44,}|bafy[0-9a-z]{50,})$/i.test(value);
}

async function fetchMetadata(urls) {
  const attempts = Array.isArray(urls) ? urls : [urls];

  for (const url of attempts) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn(`Failed to fetch ${url}:`, err);
    }
  }

  throw new Error("Metadata fetch failed");
}

async function ensureCorrectNetwork(provider, config) {
  try {
    const network = await provider.getNetwork();
    if (network?.chainId === config.chainId) return true;

    await provider.send("wallet_switchEthereumChain", [
      { chainId: config.chainIdHex },
    ]);
    return true;
  } catch (err) {
    setStatus(week3Els.status, `Switch to ${config.chainName} in your wallet`, "error");
    throw err;
  }
}

function setStatus(element, message, variant = "info") {
  if (!element) return;
  element.textContent = message;
  element.className = variant === "success" ? "form-status form-status--success" :
                       variant === "error" ? "form-status form-status--error" :
                       "form-status";
}

function shortenAddress(address = "") {
  if (!address || typeof address !== "string" || address.length < 10) {
    return address || "unknown";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "unknown";
  const date = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return "unknown";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
    throw new Error("ethers.js not loaded");
  }
}

function saveCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn("Unable to save cache", err);
  }
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to read cache", err);
    return null;
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  initWeek1();
  initWeek2();
  initWeek3();
});
