// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// OpenZeppelin ownership module (restricts admin-only functions with onlyOwner)
// Base ERC-721 NFT implementation (we intentionally avoid Enumerable + URIStorage for gas savings)
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Chainlink Automation interface (formerly Keepers) for checkUpkeep / performUpkeep
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

// Chainlink price feed interface (AggregatorV3) for reading BTC/USD on Sepolia
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// Chainlink VRF v2.5 consumer base + request builder helpers
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract BullBear is ERC721, AutomationCompatibleInterface, VRFConsumerBaseV2Plus {
    // Global market state drives which metadata set (bull vs bear) is returned by tokenURI(...)
    enum MarketTrend {
        BULL,
        BEAR
    }

    // Thrown when performUpkeep is called but conditions are not satisfied
    error UpkeepNotNeeded(uint256 currentBalance, uint256 mintedSupply, int256 currentPrice);

    // Thrown if the Chainlink feed returns an invalid price
    error InvalidPrice();

    // Thrown when a VRF callback arrives for an unknown/already-processed request
    error UnknownVrfRequest(uint256 requestId);

    // Thrown when a token doesn't yet have a VRF-assigned variant (should not happen in async mint flow)
    error VariantNotAssigned(uint256 tokenId);
    error InvalidRecipient();

    // Chainlink Sepolia BTC/USD feed address
    address public constant SEPOLIA_BTC_USD_FEED = 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43;

    // Chainlink VRF v2.5 Sepolia coordinator + keyHash (gas lane)
    address public constant SEPOLIA_VRF_COORDINATOR = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    bytes32 public constant SEPOLIA_VRF_KEYHASH = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;

    // We currently have 3 visual variants for each side (bull/bear)
    uint256 public constant VARIANT_COUNT = 3;

    // Next token id to mint (starts at 0)
    uint256 private _nextTokenId;

    // Number of tokens minted so far (tracked explicitly so we can avoid ERC721Enumerable)
    uint256 public totalMinted;

    // Minimum time between upkeep executions
    uint256 public interval;

    // Timestamp of the last successful upkeep
    uint256 public lastTimeStamp;

    // Last stored BTC/USD price from the feed (used to detect movement)
    int256 public currentPrice;

    // Current trend state used by tokenURI(...)
    MarketTrend public currentMarketTrend;

    // Chainlink Aggregator price feed instance (BTC/USD on Sepolia by default)
    AggregatorV3Interface public priceFeed;

    // -----------------------------
    // VRF v2.5 configuration state
    // -----------------------------

    // Chainlink VRF subscription ID (create/fund on vrf.chain.link and add this contract as consumer)
    uint256 public subscriptionId;

    // Callback gas for fulfillRandomWords (must be large enough to mint + store variant + emit event)
    uint32 public callbackGasLimit = 120_000;

    // Sepolia minimum is 3 confirmations (per supported networks docs)
    uint16 public requestConfirmations = 3;

    // We only need one random word to pick a variant bucket 0..2
    uint32 public constant NUM_WORDS = 1;

    // Whether to pay VRF request fee in native Sepolia ETH (true) or LINK (false)
    bool public vrfNativePayment;

    // Pending mint recipient per VRF request id (async mint flow)
    mapping(uint256 => address) public requestIdToMinter;

    // Variant assigned to each token id by VRF (0..2)
    mapping(uint256 => uint8) private _tokenVariant;

    // Explicit flag so variant 0 is distinguishable from "unset"
    mapping(uint256 => bool) private _variantAssigned;

    // Emitted whenever the global trend flips (or is re-confirmed) after upkeep
    event TokensUpdated(MarketTrend indexed trend, int256 indexed price);

    // Emitted when admin changes upkeep interval
    event IntervalUpdated(uint256 newInterval);

    // Emitted when admin changes price feed contract
    event PriceFeedUpdated(address indexed newFeed);

    // Emitted when a VRF mint request is submitted (NFT is not minted yet)
    event MintRequested(uint256 indexed requestId, address indexed to);

    // Emitted when randomness arrives and the NFT is actually minted
    event BullBearMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 indexed variantIndex,
        uint256 requestId
    );

    // Emitted when VRF config is updated
    event VrfConfigUpdated(
        uint256 subscriptionId,
        uint32 callbackGasLimit,
        uint16 requestConfirmations,
        bool nativePayment
    );

    // Deployer becomes owner; interval controls Automation update cadence.
    // subscriptionId is required for VRF v2.5 randomness requests.
    constructor(uint256 updateIntervalSeconds, uint256 vrfSubscriptionId)
        ERC721("Bull&Bear", "BBTK")
        VRFConsumerBaseV2Plus(SEPOLIA_VRF_COORDINATOR)
    {
        interval = updateIntervalSeconds;
        lastTimeStamp = block.timestamp;

        // Default feed: Chainlink BTC/USD on Sepolia
        priceFeed = AggregatorV3Interface(SEPOLIA_BTC_USD_FEED);

        // Initialize baseline price to compare future feed updates against
        currentPrice = _getLatestPrice();

        // Initial display state (first upkeep may switch to BEAR if price falls)
        currentMarketTrend = MarketTrend.BULL;

        // VRF subscription id (must be funded and this contract added as consumer)
        subscriptionId = vrfSubscriptionId;

        // Default to LINK billing for compatibility; can be changed to native via setVrfConfig(...)
        vrfNativePayment = false;
    }

    // -----------------------------
    // Minting with VRF randomness
    // -----------------------------

    // Requests randomness for a mint. The NFT is minted later inside fulfillRandomWords(...).
    // This keeps variant assignment truly random without storing predictable tokenId % 3.
    function requestMint(address to) public onlyOwner returns (uint256 requestId) {
        if (to == address(0)) revert InvalidRecipient();

        // Build a v2.5 randomness request using Chainlink helper structs.
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: SEPOLIA_VRF_KEYHASH,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: NUM_WORDS,
                // nativePayment=false => pay from subscription LINK balance
                // nativePayment=true  => pay from native token balance (Sepolia ETH)
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: vrfNativePayment})
                )
            })
        );

        requestIdToMinter[requestId] = to;
        emit MintRequested(requestId, to);
    }

    // Legacy-name wrapper to preserve your previous UX in Remix.
    // IMPORTANT: this no longer mints immediately; it requests randomness first.
    function safeMint(address to) public onlyOwner returns (uint256 requestId) {
        return requestMint(to);
    }

    // VRF callback: coordinator calls this after randomness is generated.
    // We assign a random variant, then mint the NFT atomically.
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        address to = requestIdToMinter[requestId];
        if (to == address(0)) revert UnknownVrfRequest(requestId);

        // Prevent replay/duplicate processing of the same request id.
        delete requestIdToMinter[requestId];

        uint256 tokenId = _nextTokenId;
        uint8 variant = uint8(randomWords[0] % VARIANT_COUNT);

        unchecked {
            _nextTokenId = tokenId + 1;
            totalMinted += 1;
        }

        _tokenVariant[tokenId] = variant;
        _variantAssigned[tokenId] = true;

        _safeMint(to, tokenId);

        emit BullBearMinted(to, tokenId, variant, requestId);
    }

    // -----------------------------
    // View helpers for minted supply / variants
    // -----------------------------

    // Helper for UI/debugging: the token id that will be minted next (once a VRF callback succeeds)
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    // Returns the assigned (random) variant bucket for a token (0,1,2)
    function variantOf(uint256 tokenId) external view returns (uint256) {
        _requireOwned(tokenId);
        if (!_variantAssigned[tokenId]) revert VariantNotAssigned(tokenId);
        return _tokenVariant[tokenId];
    }

    // -----------------------------
    // Admin config (Automation + Data Feed + VRF)
    // -----------------------------

    // Admin can tune how often Automation should attempt to update the trend
    function setInterval(uint256 newInterval) external onlyOwner {
        interval = newInterval;
        emit IntervalUpdated(newInterval);
    }

    // Admin can swap the price feed (useful for experiments or different markets)
    // We reset currentPrice from the new feed so the next comparison is meaningful.
    function setPriceFeed(address newFeed) external onlyOwner {
        priceFeed = AggregatorV3Interface(newFeed);
        currentPrice = _getLatestPrice();
        emit PriceFeedUpdated(newFeed);
    }

    // Admin can update VRF config after deployment (e.g., new subscription or gas tuning)
    function setVrfConfig(
        uint256 newSubscriptionId,
        uint32 newCallbackGasLimit,
        uint16 newRequestConfirmations,
        bool newNativePayment
    ) external onlyOwner {
        subscriptionId = newSubscriptionId;
        callbackGasLimit = newCallbackGasLimit;
        requestConfirmations = newRequestConfirmations;
        vrfNativePayment = newNativePayment;

        emit VrfConfigUpdated(
            newSubscriptionId,
            newCallbackGasLimit,
            newRequestConfirmations,
            newNativePayment
        );
    }

    // -----------------------------
    // Chainlink Automation (price -> trend)
    // -----------------------------

    // Chainlink Automation simulation hook (off-chain nodes call this to decide if upkeep is needed)
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        bool timePassed = (block.timestamp - lastTimeStamp) > interval;
        int256 latestPrice = _getLatestPrice();
        bool priceChanged = latestPrice != currentPrice;

        upkeepNeeded = timePassed && priceChanged;

        // No performData needed in this optimized version; performUpkeep re-reads the feed.
        performData = "";
    }

    // Chainlink Automation execution hook (anyone can call, so we must re-validate on-chain)
    function performUpkeep(bytes calldata) external override {
        bool timePassed = (block.timestamp - lastTimeStamp) > interval;
        int256 latestPrice = _getLatestPrice();
        bool priceChanged = latestPrice != currentPrice;

        if (!(timePassed && priceChanged)) {
            revert UpkeepNotNeeded(address(this).balance, totalMinted, currentPrice);
        }

        // Flip global trend according to price direction
        if (latestPrice > currentPrice) {
            currentMarketTrend = MarketTrend.BULL;
        } else {
            currentMarketTrend = MarketTrend.BEAR;
        }

        // Persist state for the next upkeep cycle
        currentPrice = latestPrice;
        lastTimeStamp = block.timestamp;

        // Key optimization: no loop over all NFTs, no URI rewrites.
        // tokenURI(...) reflects the new trend automatically.
        emit TokensUpdated(currentMarketTrend, latestPrice);
    }

    // -----------------------------
    // Metadata (dynamic tokenURI)
    // -----------------------------

    // Returns metadata URI dynamically based on:
    // 1) current global trend (bull/bear), and
    // 2) VRF-assigned per-token variant bucket (0..2)
    // This preserves the "3 levels" artwork system while keeping upkeep O(1).
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (!_variantAssigned[tokenId]) revert VariantNotAssigned(tokenId);

        uint256 variant = _tokenVariant[tokenId];

        if (currentMarketTrend == MarketTrend.BULL) {
            return _bullUriByVariant(variant);
        }

        return _bearUriByVariant(variant);
    }

    // Public helper for UIs: preview what URI a token would have under a chosen trend
    function previewTokenURI(uint256 tokenId, MarketTrend trend) external view returns (string memory) {
        _requireOwned(tokenId);
        if (!_variantAssigned[tokenId]) revert VariantNotAssigned(tokenId);

        uint256 variant = _tokenVariant[tokenId];

        if (trend == MarketTrend.BULL) {
            return _bullUriByVariant(variant);
        }
        return _bearUriByVariant(variant);
    }

    // Reads latest BTC/USD from Chainlink AggregatorV3 feed
    function getLatestPrice() external view returns (int256) {
        return _getLatestPrice();
    }

    // Internal feed reader (answer is typically 8 decimals for BTC/USD, but we only compare direction)
    function _getLatestPrice() internal view returns (int256) {
        (, int256 answer,,,) = priceFeed.latestRoundData();

        if (answer <= 0) revert InvalidPrice();
        return answer;
    }

    // Bull metadata mapping by variant index.
    // Index alignment strategy (based on the actual assets):
    // 0 => gamer_bull   (paired with beanie_bear as "winter/gear" style)
    // 1 => party_bull   (paired with coolio_bear as "cool/accessory" style)
    // 2 => simple_bull  (paired with simple_bear as base style)
    function _bullUriByVariant(uint256 variant) internal pure returns (string memory) {
        if (variant == 0) {
            return "https://ipfs.io/ipfs/QmRXyfi3oNZCubDxiVFre3kLZ8XeGt6pQsnAQRZ7akhSNs?filename=gamer_bull.json";
        }
        if (variant == 1) {
            return "https://ipfs.io/ipfs/QmRJVFeMrtYS2CUVUM2cHJpBV5aX2xurpnsfZxLTTQbiD3?filename=party_bull.json";
        }
        return "https://ipfs.io/ipfs/QmdcURmN1kEEtKgnbkVJJ8hrmsSWHpZvLkRgsKKoiWvW9g?filename=simple_bull.json";
    }

    // Bear metadata mapping by variant index (aligned by style/complexity, not exact name symmetry)
    function _bearUriByVariant(uint256 variant) internal pure returns (string memory) {
        if (variant == 0) {
            return "https://ipfs.io/ipfs/Qmdx9Hx7FCDZGExyjLR6vYcnutUR8KhBZBnZfAPHiUommN?filename=beanie_bear.json";
        }
        if (variant == 1) {
            return "https://ipfs.io/ipfs/QmTVLyTSuiKGUEmb88BgXG3qNC8YgpHZiFbjHrXKH3QHEu?filename=coolio_bear.json";
        }
        return "https://ipfs.io/ipfs/QmbKhBXVWmwrYsTPFYfroR2N7NAekAMxHUVg2CWks7i9qj?filename=simple_bear.json";
    }
}
