// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentPayToken is ERC20, ERC20Permit, Ownable {

    constructor()
        ERC20("Agent Payment Token", "APT")
        ERC20Permit("Agent Payment Token")
    {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function faucet() external {
        _mint(msg.sender, 1000 * 10**decimals());
    }
}