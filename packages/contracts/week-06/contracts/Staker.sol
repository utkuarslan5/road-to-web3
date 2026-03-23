// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./ExampleExternalContract.sol";

error AlreadyStaked();
error StakeWindowClosed();
error ZeroValue();
error NotStaker();
error WithdrawWindowClosed();
error WithdrawWindowNotOpen();
error AlreadyWithdrawn();
error LockWindowNotOpen();
error NoFundsToLock();

contract Staker {
    ExampleExternalContract public immutable exampleExternalContract;

    address public staker;
    uint256 public stakedAt;
    uint256 public stakeDeadline;
    uint256 public withdrawDeadline;
    uint256 public stakedAmount;
    bool public withdrawn;

    uint256 public constant REWARD_PER_BLOCK = 0.1 ether;
    uint256 public constant SECONDS_PER_BLOCK = 12;

    event Staked(address indexed staker, uint256 amount);
    event Withdrawn(address indexed staker, uint256 payout, uint256 reward);

    modifier onlyStaker() {
        if (msg.sender != staker) revert NotStaker();
        _;
    }

    modifier stakeOpen() {
        if (block.timestamp >= stakeDeadline) revert StakeWindowClosed();
        _;
    }

    modifier withdrawOpen() {
        if (block.timestamp < stakeDeadline) revert WithdrawWindowNotOpen();
        if (block.timestamp >= withdrawDeadline) revert WithdrawWindowClosed();
        _;
    }

    modifier withdrawClosed() {
        if (block.timestamp < withdrawDeadline) revert LockWindowNotOpen();
        _;
    }

    constructor(address exampleExternalContractAddress) {
        exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
        stakeDeadline = block.timestamp + 2 minutes;
        withdrawDeadline = block.timestamp + 4 minutes;
    }

    function stake() external payable stakeOpen {
        if (msg.value == 0) revert ZeroValue();
        if (stakedAmount > 0) revert AlreadyStaked();

        staker = msg.sender;
        stakedAt = block.timestamp;
        stakedAmount = msg.value;
        emit Staked(msg.sender, msg.value);
    }

    function calculateReward() public view returns (uint256) {
        if (stakedAmount == 0 || block.timestamp <= stakedAt) {
            return 0;
        }

        uint256 lastRewardTimestamp = block.timestamp < stakeDeadline ? block.timestamp : stakeDeadline;
        if (lastRewardTimestamp <= stakedAt) {
            return 0;
        }

        uint256 eligibleSeconds = lastRewardTimestamp - stakedAt;
        return (eligibleSeconds * REWARD_PER_BLOCK) / SECONDS_PER_BLOCK;
    }

    function withdraw() external onlyStaker withdrawOpen {
        if (withdrawn) revert AlreadyWithdrawn();
        uint256 reward = calculateReward();
        uint256 payout = stakedAmount + reward;

        withdrawn = true;
        // send after state changes to avoid reentrancy
        (bool success, ) = payable(staker).call{value: payout}("");
        require(success, "Transfer failed");

        emit Withdrawn(staker, payout, reward);
    }

    function withdrawableAmount() external view returns (uint256) {
        if (block.timestamp < stakeDeadline || block.timestamp >= withdrawDeadline || stakedAmount == 0 || withdrawn) {
            return 0;
        }

        return stakedAmount + calculateReward();
    }

    function lockFundsInExternalContract() external withdrawClosed {
        uint256 contractBalance = address(this).balance;
        if (contractBalance == 0) revert NoFundsToLock();
        exampleExternalContract.complete{value: contractBalance}();
    }

    receive() external payable {}
}
