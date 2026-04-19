// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HLUSD
 * @dev Mock HLUSD stablecoin for HeLa Network testing
 * In production, this would be the actual HLUSD token
 */
contract HLUSD is ERC20, Ownable {
    constructor() ERC20("HeLa USD", "HLUSD") Ownable(msg.sender) {
        // Mint initial supply for testing (1 million HLUSD)
        _mint(msg.sender, 1_000_000 * 10**decimals());
    }

    /**
     * @dev Mint tokens for testing purposes
     * @param to Address to receive tokens
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Decimals set to 6 to match typical stablecoin standards
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
