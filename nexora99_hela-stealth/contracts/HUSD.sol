// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HUSD - USD-Pegged Stablecoin
 * @notice Hackathon stablecoin for the StealthCheckout protocol on HeLa.
 */
contract HUSD is ERC20, Ownable {

    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    constructor() ERC20("HUSD Stablecoin", "HUSD") Ownable(msg.sender) {}

    /**
     * @notice Mint new HUSD tokens. Only callable by the contract owner.
     * @param to   Recipient address.
     * @param amount Number of tokens (18 decimals).
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit Mint(to, amount);
    }

    /**
     * @notice Burn tokens from the caller's balance.
     * @param amount Number of tokens to burn.
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }
}
