// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContentNFT is ERC721A, Ownable {
    constructor(string memory name, string memory symbol) ERC721A(name, symbol) {}

    function mintAccess(address to) external onlyOwner returns (uint256) {
        uint256 tokenId = totalSupply();
        _mint(to, 1);
        return tokenId;
    }
}
