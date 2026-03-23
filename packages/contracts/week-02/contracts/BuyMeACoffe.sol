// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BuyMeACoffe
 * @notice Minimal tipping contract so supporters can "buy you a coffee".
 */
contract BuyMeACoffe {
    struct Memo {
        address supporter;
        uint256 timestamp;
        string name;
        string message;
    }

    address payable private _owner;
    Memo[] private _memos;

    event NewCoffee(
        address indexed supporter,
        uint256 value,
        string name,
        string message
    );
    event Withdraw(address indexed to, uint256 amount);
    event OwnerUpdated(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error NoTips();
    error TipTooSmall();

    constructor() {
        _owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        if (msg.sender != _owner) revert NotOwner();
        _;
    }

    /**
     * @notice Send a tip along with a short memo.
     * @param name Display name of the supporter.
     * @param message Message to the creator.
     */
    function buyCoffee(
        string calldata name,
        string calldata message
    ) external payable {
        if (msg.value == 0) revert TipTooSmall();

        _memos.push(
            Memo({
                supporter: msg.sender,
                timestamp: block.timestamp,
                name: name,
                message: message
            })
        );

        emit NewCoffee(msg.sender, msg.value, name, message);
    }

    /**
     * @notice Withdraw all pending tips to an address.
     * @param to Recipient wallet.
     */
    function withdrawTips(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoTips();

        (bool sent, ) = to.call{value: balance}("");
        require(sent, "Transfer failed");

        emit Withdraw(to, balance);
    }

    /**
     * @notice Update the owner that receives future withdrawals.
     */
    function updateOwner(address payable newOwner) external onlyOwner {
        require(newOwner != address(0), "zero address");
        address previous = _owner;
        _owner = newOwner;
        emit OwnerUpdated(previous, newOwner);
    }

    /**
     * @notice Return all recorded memos.
     */
    function memos() external view returns (Memo[] memory) {
        return _memos;
    }

    function owner() external view returns (address) {
        return _owner;
    }
}
