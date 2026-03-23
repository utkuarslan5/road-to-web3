// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract LabMintTrophy {
    string public constant name = "LabMint Trophy";
    string public constant symbol = "LMT";

    function tokenURI(uint256 tokenId) external pure returns (string memory) {
        require(tokenId == 0, "Only token 0 exists");
        return "ipfs://QmPlaceholderWeek1Metadata";
    }
}
