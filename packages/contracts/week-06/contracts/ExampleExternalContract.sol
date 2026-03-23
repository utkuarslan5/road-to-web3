// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract ExampleExternalContract {
    bool public completed;
    uint256 public completedAt;
    uint256 public totalReceived;

    event FundsLocked(address indexed caller, uint256 amount, uint256 timestamp);

    modifier notCompleted() {
        require(!completed, "Funds already locked");
        _;
    }

    function complete() external payable notCompleted {
        require(msg.value > 0, "No value sent");
        completed = true;
        completedAt = block.timestamp;
        totalReceived = msg.value;
        emit FundsLocked(msg.sender, msg.value, block.timestamp);
    }
}
