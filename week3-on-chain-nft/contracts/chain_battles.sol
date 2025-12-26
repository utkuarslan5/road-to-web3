// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract ChainBattles is ERC721URIStorage {
    using Strings for uint256;

    // Custom errors for gas savings
    error TokenDoesNotExist();
    error NotTokenOwner();
    error CooldownActive();
    error SameToken();
    error AttackerMissing();
    error DefenderMissing();

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
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        Stats storage s = _stats[tokenId];
        if (block.timestamp < s.lastAction + TRAIN_COOLDOWN) revert CooldownActive();

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
        if (attackerId == defenderId) revert SameToken();
        if (ownerOf(attackerId) != msg.sender) revert NotTokenOwner();
        
        Stats storage a = _stats[attackerId];
        Stats storage d = _stats[defenderId];
        if (block.timestamp < a.lastAction + TRAIN_COOLDOWN) revert CooldownActive();

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
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        return _stats[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        return _buildTokenURI(tokenId);
    }

    function _buildTokenURI(uint256 tokenId) private view returns (string memory) {
        string memory image = _buildCharacterSVG(tokenId);
        string memory tokenIdStr = tokenId.toString();
        bytes memory dataURI = abi.encodePacked(
            '{"name":"Chain Battles #', tokenIdStr, '","description":"On-chain warriors that train, duel, and evolve.","image":"', image, '"}'
        );
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    // Simplified SVG for gas optimization
    function _buildCharacterSVG(uint256 tokenId) private view returns (string memory) {
        Stats memory s = _stats[tokenId];
        string memory tokenIdStr = tokenId.toString();
        string memory levelStr = uint256(s.level).toString();
        string memory powerStr = _barWidth(s.power, 120);
        string memory agilityStr = _barWidth(s.agility, 100);
        string memory vitalityStr = _barWidth(s.vitality, 140);
        string memory victoriesStr = uint256(s.victories).toString();
        string memory defeatsStr = uint256(s.defeats).toString();
        string memory rarityStr = _rarityLabel(s.rarity);
        string memory cooldownStr = _cooldownText(s.lastAction);
        
        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">',
            '<rect width="300" height="300" fill="#0f172a"/>',
            '<rect x="10" y="10" width="280" height="280" fill="#1e293b" stroke="#22d3ee" stroke-width="2"/>',
            '<text x="150" y="40" fill="#e0f2fe" font-size="18" text-anchor="middle">CHAIN WARRIOR</text>',
            '<text x="150" y="65" fill="#cbd5e1" font-size="14" text-anchor="middle">#', tokenIdStr, ' - ', rarityStr, '</text>',
            '<text x="150" y="95" fill="#94a3b8" font-size="12" text-anchor="middle">LEVEL</text>',
            '<text x="150" y="115" fill="#e2e8f0" font-size="16" text-anchor="middle">', levelStr, '</text>',
            '<text x="20" y="150" fill="#94a3b8" font-size="11">POWER</text>',
            '<rect x="20" y="155" width="200" height="12" fill="#0f172a" stroke="#22d3ee" stroke-width="1"/>',
            '<rect x="20" y="155" width="', powerStr, '" height="12" fill="#22d3ee"/>',
            '<text x="20" y="180" fill="#94a3b8" font-size="11">AGILITY</text>',
            '<rect x="20" y="185" width="200" height="10" fill="#0f172a" stroke="#22d3ee" stroke-width="1"/>',
            '<rect x="20" y="185" width="', agilityStr, '" height="10" fill="#22d3ee"/>',
            '<text x="20" y="210" fill="#94a3b8" font-size="11">VITALITY</text>',
            '<rect x="20" y="215" width="200" height="10" fill="#0f172a" stroke="#22d3ee" stroke-width="1"/>',
            '<rect x="20" y="215" width="', vitalityStr, '" height="10" fill="#22d3ee"/>',
            '<text x="20" y="245" fill="#94a3b8" font-size="11">W / L</text>',
            '<text x="20" y="265" fill="#e2e8f0" font-size="14">', victoriesStr, ' / ', defeatsStr, '</text>',
            '<text x="20" y="285" fill="#94a3b8" font-size="10">', cooldownStr, '</text>',
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
        uint256 width = (clamped * 200) / cap; // map 0..cap to 0..200px
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
        if (block.timestamp > lastAction + TRAIN_COOLDOWN) {
            return "Ready";
        }
        uint256 remaining = lastAction + TRAIN_COOLDOWN - block.timestamp;
        return string(abi.encodePacked(remaining.toString(), "s"));
    }
}
