    // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IntentSwap {
    address public owner;

    event SwapExecuted(
        address indexed user,
        string  fromToken,
        string  toToken,
        uint256 amount,
        uint256 timestamp
    );

    event SwapSimulated(
        address indexed user,
        string  fromToken,
        string  toToken,
        uint256 amount,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    function executeSwap(
        string memory fromToken,
        string memory toToken,
        uint256 amount
    ) external payable {
        require(amount > 0, "Amount must be > 0");
        emit SwapExecuted(msg.sender, fromToken, toToken, amount, block.timestamp);
    }

    function simulateSwap(
        string memory fromToken,
        string memory toToken,
        uint256 amount
    ) external {
        require(amount > 0, "Amount must be > 0");
        emit SwapSimulated(msg.sender, fromToken, toToken, amount, block.timestamp);
    }

    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {}
}