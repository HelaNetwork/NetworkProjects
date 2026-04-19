// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HLUSD
 * @dev Standard ERC20 Token for the WTF Browser ecosystem on Hela Testnet.
 * Features an initial supply and owner-only minting capability for reward distribution.
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HLUSD is ERC20, Ownable {
    constructor() ERC20("Hela USD", "HLUSD") Ownable(msg.sender) {
        // Mint an initial supply of 1 billion tokens to the deployer for the rewards pool
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    /**
     * @dev Allows the owner (e.g., the SyncRewards contract) to mint new tokens if the pool runs out.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
