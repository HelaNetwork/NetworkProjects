// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LandNFT is ERC721A, Ownable {
    uint256 public constant BASE_PRICE = 0.01 ether;
    uint256 public constant PRICE_SLOPE = 0.001 ether;

    event LandMinted(address indexed buyer, uint256 tokenId, uint256 price);

    constructor() ERC721A("HelaVirtualLand", "HVL") {}

    function getPrice() public view returns (uint256) {
        return BASE_PRICE + (totalSupply() * PRICE_SLOPE);
    }

    function mint() external payable {
        uint256 price = getPrice();
        require(msg.value >= price, "Insufficient funds for bonding curve price");

        uint256 tokenId = totalSupply();
        _mint(msg.sender, 1);

        // Refund excess
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit LandMinted(msg.sender, tokenId, price);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
