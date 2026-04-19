// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockHLUSD
 * @notice Mock ERC20 for testing. Has a public mint function.
 */
contract MockHLUSD is ERC20 {
    constructor() ERC20("Mock HLUSD", "HLUSD") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
