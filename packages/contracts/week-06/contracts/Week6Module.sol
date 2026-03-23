// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Week6Module {
    bytes32 public constant ASSIGNMENT_ID = keccak256("road-to-web3-week-6-staking");
    string public constant WEEK = "Week 6";
    string public constant TITLE = "Build a Staking Application";
    uint256 public constant STAKE_WINDOW_SECONDS = 2 minutes;
    uint256 public constant WITHDRAW_WINDOW_SECONDS = 4 minutes;

    function assignment() external pure returns (bytes32 id, string memory week, string memory title, string memory summary) {
        return (
            ASSIGNMENT_ID,
            WEEK,
            TITLE,
            "Stake ETH, withdraw rewards before the window closes, and lock remaining funds into the external contract after the cooldown."
        );
    }
}
