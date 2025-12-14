// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract ChainBattles is ERC721URIStorage {
    using Strings for uint256;

    uint256 private _nextTokenId;

    /// @notice core state for each warrior
    struct Stats {
        uint48 lastAction; // cooldown timestamp (seconds)
        uint16 level;
        uint16 power;
        uint16 agility;
        uint16 vitality;
        uint32 victories;
        uint32 defeats;
        uint8 rarity; // 0-4 (Common -> Mythic)
    }

    mapping(uint256 => Stats) private _stats;

    uint256 private constant TRAIN_COOLDOWN = 60; // 1 minute between actions

    constructor() ERC721("Chain Battles", "CBTLS") {}

    function mint() external {
        uint256 tokenId = ++_nextTokenId;
        _safeMint(msg.sender, tokenId);
        _stats[tokenId] = Stats({
            lastAction: uint48(block.timestamp),
            level: 1,
            power: 12,
            agility: 10,
            vitality: 14,
            victories: 0,
            defeats: 0,
            rarity: _rollRarity(tokenId)
        });
        _setTokenURI(tokenId, _buildTokenURI(tokenId));
    }

    function train(uint256 tokenId) external {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        Stats storage s = _stats[tokenId];
        require(block.timestamp >= s.lastAction + TRAIN_COOLDOWN, "Cooldown");

        // deterministic-ish growth with some variance
        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    tokenId,
                    s.level
                )
            )
        );

        s.lastAction = uint48(block.timestamp);
        s.level += 1;
        s.power += uint16(1 + (rand % 3)); // +1 to +3
        s.agility += uint16(1 + ((rand >> 16) % 2)); // +1 or +2
        s.vitality += uint16(1 + ((rand >> 32) % 2)); // +1 or +2

        _setTokenURI(tokenId, _buildTokenURI(tokenId));
    }

    function battle(uint256 attackerId, uint256 defenderId) external returns (bool attackerWon) {
        require(attackerId != defenderId, "Same token");
        require(_ownerOf(attackerId) != address(0), "Attacker missing");
        require(_ownerOf(defenderId) != address(0), "Defender missing");
        require(ownerOf(attackerId) == msg.sender, "Not attacker owner");

        Stats storage a = _stats[attackerId];
        Stats storage d = _stats[defenderId];
        require(block.timestamp >= a.lastAction + TRAIN_COOLDOWN, "Cooldown");

        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    attackerId,
                    defenderId,
                    a.victories + d.victories
                )
            )
        );

        uint256 attackScore = _score(a) + (rand % 16); // 0-15 spice
        uint256 defenseScore = _score(d) + ((rand >> 32) % 16);

        attackerWon = attackScore >= defenseScore;
        a.lastAction = uint48(block.timestamp);

        if (attackerWon) {
            a.victories += 1;
            if (a.level < type(uint16).max) a.level += 1;
            if (a.power < type(uint16).max) a.power += 1;
            if (a.agility < type(uint16).max) a.agility += 1;
            if (a.vitality < type(uint16).max) a.vitality += 1;
            d.defeats += 1;
        } else {
            d.victories += 1;
            a.defeats += 1;
        }

        _setTokenURI(attackerId, _buildTokenURI(attackerId));
        _setTokenURI(defenderId, _buildTokenURI(defenderId));
    }

    function statsOf(uint256 tokenId) external view returns (Stats memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _stats[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _buildTokenURI(tokenId);
    }

    function _buildTokenURI(uint256 tokenId) private view returns (string memory) {
        string memory image = _buildCharacterSVG(tokenId);
        bytes memory dataURI = abi.encodePacked(
            "{",
                '"name":"Chain Battles #', tokenId.toString(), '",',
                '"description":"On-chain warriors that train, duel, and evolve. Cooldowns, rarity, battle log all on-chain.",',
                '"image":"', image, '"',
            "}"
        );
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    // SVG render packs core stats and rarity glow
    function _buildCharacterSVG(uint256 tokenId) private view returns (string memory) {
        Stats memory s = _stats[tokenId];
        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 380" preserveAspectRatio="xMinYMin meet">',
            '<defs>',
                '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                    '<stop offset="0%" stop-color="#0f172a" />',
                    '<stop offset="50%" stop-color="#1e3a8a" />',
                    '<stop offset="100%" stop-color="#22d3ee" />',
                '</linearGradient>',
                '<linearGradient id="frame" x1="0%" y1="0%" x2="100%" y2="100%">',
                    '<stop offset="0%" stop-color="#22d3ee" />',
                    '<stop offset="50%" stop-color="#a855f7" />',
                    '<stop offset="100%" stop-color="#f97316" />',
                '</linearGradient>',
                '<linearGradient id="bar" x1="0%" y1="0%" x2="100%" y2="0%">',
                    '<stop offset="0%" stop-color="#22d3ee" />',
                    '<stop offset="100%" stop-color="#a855f7" />',
                '</linearGradient>',
                '<radialGradient id="halo" cx="50%" cy="40%" r="60%">',
                    '<stop offset="0%" stop-color="rgba(255,255,255,0.4)" />',
                    '<stop offset="100%" stop-color="rgba(255,255,255,0)" />',
                '</radialGradient>',
                '<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">',
                    '<feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#22d3ee" flood-opacity="0.6" />',
                '</filter>',
            '</defs>',
            '<rect width="100%" height="100%" fill="url(#bg)"/>',
            '<rect x="18" y="18" width="344" height="344" rx="18" fill="#0b1224" opacity="0.85" stroke="url(#frame)" stroke-width="3" filter="url(#glow)"/>',
            '<circle cx="190" cy="135" r="95" fill="url(#halo)" />',
            '<style>',
                '.title{fill:#e0f2fe;font-family:\"Trebuchet MS\",sans-serif;font-size:20px;font-weight:700;letter-spacing:1.2px;}',
                '.stat{fill:#e2e8f0;font-family:\"Trebuchet MS\",sans-serif;font-size:16px;}',
                '.label{fill:#94a3b8;font-family:\"Trebuchet MS\",sans-serif;font-size:12px;letter-spacing:1px;}',
                '.small{fill:#94a3b8;font-family:\"Trebuchet MS\",sans-serif;font-size:10px;}',
            '</style>',
            '<text x="50%" y="70" class="title" text-anchor="middle" dominant-baseline="middle">CHAIN WARRIOR</text>',
            '<text x="50%" y="98" class="stat" text-anchor="middle" dominant-baseline="middle">#', tokenId.toString(), ' - ', _rarityLabel(s.rarity), '</text>',
            '<text x="50%" y="132" class="label" text-anchor="middle" dominant-baseline="middle">LEVEL</text>',
            '<text x="50%" y="156" class="stat" text-anchor="middle" dominant-baseline="middle">', uint256(s.level).toString(), '</text>',
            '<g transform="translate(50,190)">',
                '<text x="0" y="0" class="label">POWER BAR</text>',
                '<rect x="0" y="10" width="280" height="14" rx="7" fill="#0f172a" stroke="#22d3ee" stroke-width="1"/>',
                '<rect x="0" y="10" width="', _barWidth(s.power, 120), '" height="14" rx="7" fill="url(#bar)">',
                    '<animate attributeName="width" values="0;', _barWidth(s.power, 120), '" dur="0.9s" fill="freeze" />',
                '</rect>',
            '</g>',
            '<g transform="translate(50,230)">',
                '<text x="0" y="0" class="label">AGILITY</text>',
                '<rect x="0" y="10" width="200" height="10" rx="5" fill="#0f172a" stroke="#22d3ee" stroke-width="1"/>',
                '<rect x="0" y="10" width="', _barWidth(s.agility, 100), '" height="10" rx="5" fill="url(#bar)"/>',
            '</g>',
            '<g transform="translate(50,260)">',
                '<text x="0" y="0" class="label">VITALITY</text>',
                '<rect x="0" y="10" width="200" height="10" rx="5" fill="#0f172a" stroke="#22d3ee" stroke-width="1"/>',
                '<rect x="0" y="10" width="', _barWidth(s.vitality, 140), '" height="10" rx="5" fill="url(#bar)"/>',
            '</g>',
            '<g transform="translate(50,300)">',
                '<text x="0" y="0" class="label">W / L</text>',
                '<text x="0" y="20" class="stat">', uint256(s.victories).toString(), ' / ', uint256(s.defeats).toString(), '</text>',
                '<text x="0" y="40" class="small">Cooldown: ', _cooldownText(s.lastAction), '</text>',
            '</g>',
            '</svg>'
        );
        return string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(svg)
            )
        );
    }

    function _barWidth(uint256 stat, uint256 cap) private pure returns (string memory) {
        uint256 clamped = stat > cap ? cap : stat;
        uint256 width = (clamped * 280) / cap; // map 0..cap to 0..280px
        return width.toString();
    }

    function _score(Stats memory s) private pure returns (uint256) {
        // rarity adds 0..40, level contributes most
        return
            (uint256(s.level) * 5) +
            (uint256(s.power) * 3) +
            (uint256(s.agility) * 2) +
            uint256(s.vitality) +
            uint256(s.rarity) * 10;
    }

    function _rollRarity(uint256 tokenId) private view returns (uint8) {
        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    msg.sender,
                    tokenId
                )
            )
        ) % 100;

        if (rand < 50) return 0; // Common
        if (rand < 78) return 1; // Uncommon
        if (rand < 92) return 2; // Rare
        if (rand < 98) return 3; // Epic
        return 4; // Mythic
    }

    function _rarityLabel(uint8 rarity) private pure returns (string memory) {
        if (rarity == 0) return "Common";
        if (rarity == 1) return "Uncommon";
        if (rarity == 2) return "Rare";
        if (rarity == 3) return "Epic";
        return "Mythic";
    }

    function _cooldownText(uint48 lastAction) private view returns (string memory) {
        if (block.timestamp <= lastAction + TRAIN_COOLDOWN) {
            uint256 remaining = lastAction + TRAIN_COOLDOWN - block.timestamp;
            return string(abi.encodePacked("Ready in ", remaining.toString(), "s"));
        }
        return "Ready";
    }
}
