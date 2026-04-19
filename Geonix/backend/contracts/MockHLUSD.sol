// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockHLUSD is ERC20, Ownable {
    constructor() ERC20("HeLa USD", "HLUSD") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 10_000_000 * 10**18); // 10 million tokens
    }

    /**
     * @dev Mint new tokens - only for testing
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Allows anyone to mint tokens for testing purposes
     */
    function faucet(uint256 amount) external {
        require(amount <= 10000 * 10**18, "Max 10k tokens per request");
        _mint(msg.sender, amount);
    }
}