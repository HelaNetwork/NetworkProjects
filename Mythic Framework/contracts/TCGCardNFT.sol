// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TCGCardNFT is ERC721A, Ownable {
    uint256 public boosterPackPrice = 0.05 ether;

    enum Rarity { Common, Rare, Legendary }

    mapping(uint256 => Rarity) public cardRarities;

    event PackOpened(address indexed player, uint256[] tokenIds, Rarity[] rarities);

    constructor() ERC721A("HelaTCGCard", "HTC") {}

    function buyBoosterPack() external payable {
        require(msg.value >= boosterPackPrice, "Insufficient funds");

        uint256 startTokenId = _nextTokenId();
        _mint(msg.sender, 3); // 3 cards per pack

        uint256[] memory mintedIds = new uint256[](3);
        Rarity[] memory rarities = new Rarity[](3);

        for (uint256 i = 0; i < 3; i++) {
            uint256 tokenId = startTokenId + i;
            
            // Pseudo-random rarity curve
            uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, i))) % 100;
            Rarity rarity;
            
            if (rand < 70) {
                rarity = Rarity.Common;
            } else if (rand < 95) {
                rarity = Rarity.Rare;
            } else {
                rarity = Rarity.Legendary;
            }

            cardRarities[tokenId] = rarity;
            mintedIds[i] = tokenId;
            rarities[i] = rarity;
        }

        emit PackOpened(msg.sender, mintedIds, rarities);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
