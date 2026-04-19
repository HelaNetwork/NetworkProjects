// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title HLUSDMock
 * @notice Minimal ERC-20 mock with public mint for testing purposes.
 */
contract HLUSDMock is ERC20 {
    constructor() ERC20("HLUSD Mock", "HLUSD") {}

    /**
     * @notice Mint tokens to any address (test only).
     * @param to     Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
