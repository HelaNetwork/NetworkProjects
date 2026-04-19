// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title DeckWarsCard - ERC-721 NFT for DeckWars battle cards
/// @notice Each card has stats (HP, Attack, Defense, Speed) and up to 4 moves.
///         Moves are addresses of IMove contracts, making cards composable and extensible.
contract DeckWarsCard is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    // Card archetypes/classes
    enum CardClass { Warrior, Mage, Rogue, Paladin, Ranger }

    struct CardStats {
        string name;
        CardClass cardClass;
        uint256 hp;
        uint256 maxHp;
        uint256 attack;
        uint256 defense;
        uint256 speed;
        address[4] moves;   // IMove contract addresses (up to 4 moves)
        uint8 moveCount;
        uint8 rarity;       // 1=Common, 2=Rare, 3=Epic, 4=Legendary
    }

    mapping(uint256 => CardStats) public cardStats;

    // Predefined card templates for minting
    struct CardTemplate {
        string name;
        CardClass cardClass;
        uint256 hp;
        uint256 attack;
        uint256 defense;
        uint256 speed;
        uint8 rarity;
    }

    CardTemplate[] public templates;
    address[4] public defaultMoves; // Set after move contracts are deployed

    event CardMinted(address indexed to, uint256 indexed tokenId, string cardName, CardClass cardClass);
    event MovesUpdated(uint256 indexed tokenId, address[4] moves);

    constructor() ERC721("DeckWars Card", "DWC") Ownable(msg.sender) {}

    /// @notice Set the default move contracts (called after move contracts are deployed)
    function setDefaultMoves(address[4] calldata _moves) external onlyOwner {
        defaultMoves = _moves;
    }

    /// @notice Add a card template that players can mint
    function addTemplate(
        string calldata _name,
        CardClass _class,
        uint256 _hp,
        uint256 _attack,
        uint256 _defense,
        uint256 _speed,
        uint8 _rarity
    ) external onlyOwner {
        templates.push(CardTemplate({
            name: _name,
            cardClass: _class,
            hp: _hp,
            attack: _attack,
            defense: _defense,
            speed: _speed,
            rarity: _rarity
        }));
    }

    /// @notice Mint a card from a template (free for testnet demo)
    function mintCard(uint256 templateId) external returns (uint256) {
        require(templateId < templates.length, "Invalid template");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        CardTemplate memory tmpl = templates[templateId];
        cardStats[tokenId] = CardStats({
            name: tmpl.name,
            cardClass: tmpl.cardClass,
            hp: tmpl.hp,
            maxHp: tmpl.hp,
            attack: tmpl.attack,
            defense: tmpl.defense,
            speed: tmpl.speed,
            moves: defaultMoves,
            moveCount: 4,
            rarity: tmpl.rarity
        });

        _safeMint(msg.sender, tokenId);
        emit CardMinted(msg.sender, tokenId, tmpl.name, tmpl.cardClass);
        return tokenId;
    }

    /// @notice Get full stats of a card
    function getCardStats(uint256 tokenId) external view returns (CardStats memory) {
        require(ownerOf(tokenId) != address(0), "Card does not exist");
        return cardStats[tokenId];
    }

    /// @notice Get all card IDs owned by an address
    function getOwnedCards(address owner) external view returns (uint256[] memory) {
        uint256 total = _tokenIdCounter;
        uint256 count = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (_ownerOf(i) == owner) count++;
        }
        uint256[] memory owned = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (_ownerOf(i) == owner) {
                owned[idx++] = i;
            }
        }
        return owned;
    }

    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function templateCount() external view returns (uint256) {
        return templates.length;
    }
}
