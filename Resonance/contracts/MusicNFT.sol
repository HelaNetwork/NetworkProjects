// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "erc721a/contracts/ERC721A.sol";

contract MusicNFT is ERC721A, Ownable {
    using Strings for uint256;

    struct RoyaltyData {
        address recipient;
        uint16 bps; // basis points (10000 = 100%)
    }

    struct TrackInfo {
        string ipfsHash; // IPFS hash for audio
        string coverArtHash; // IPFS hash for cover art
        string genre;
        uint256 duration; // in seconds
    }

    string private _baseTokenURI;
    bool public metadataFrozen;
    
    // tokenId => royalty info
    mapping(uint256 => RoyaltyData) private _royaltyData;
    // tokenId => track info
    mapping(uint256 => TrackInfo) private _trackInfo;
    // tokenId => artist address
    mapping(uint256 => address) private _trackArtist;

    // ERC2981 interfaceId: 0x2a55205a
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    event TrackMinted(uint256 indexed tokenId, address indexed artist, string ipfsHash);
    event RoyaltySet(uint256 indexed tokenId, address recipient, uint16 bps);
    event MetadataFrozen();

    constructor(string memory name_, string memory symbol_) 
        ERC721A(name_, symbol_) 
    {}

    function mint(
        address to,
        uint256 quantity,
        string memory ipfsHash,
        string memory coverArtHash,
        string memory genre,
        uint256 duration,
        address royaltyRecipient,
        uint16 royaltyBps
    ) external onlyOwner {
        uint256 startTokenId = _nextTokenId();
        
        _safeMint(to, quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = startTokenId + i;
            _trackInfo[tokenId] = TrackInfo({
                ipfsHash: ipfsHash,
                coverArtHash: coverArtHash,
                genre: genre,
                duration: duration
            });
            _trackArtist[tokenId] = to;
            
            if (royaltyRecipient != address(0) && royaltyBps > 0) {
                _royaltyData[tokenId] = RoyaltyData(royaltyRecipient, royaltyBps);
            }
            
            emit TrackMinted(tokenId, to, ipfsHash);
        }
    }

    function setRoyalty(uint256 tokenId, address recipient, uint16 bps) external {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender || owner() == msg.sender, "Not authorized");
        _royaltyData[tokenId] = RoyaltyData(recipient, bps);
        emit RoyaltySet(tokenId, recipient, bps);
    }

    // ERC2981 royalty info
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external 
        view 
        returns (address receiver, uint256 royaltyAmount) 
    {
        RoyaltyData memory data = _royaltyData[tokenId];
        if (data.recipient == address(0) || data.bps == 0) {
            return (address(0), 0);
        }
        receiver = data.recipient;
        royaltyAmount = (salePrice * data.bps) / 10000;
    }

    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        require(_exists(tokenId), "URI query for nonexistent token");
        
        TrackInfo memory track = _trackInfo[tokenId];
        return bytes(_baseTokenURI).length > 0 
            ? string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"))
            : string(abi.encodePacked("ipfs://", track.ipfsHash));
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        require(!metadataFrozen, "Metadata is frozen");
        _baseTokenURI = baseURI;
    }

    function freezeMetadata() external onlyOwner {
        metadataFrozen = true;
        emit MetadataFrozen();
    }

    function getTrackInfo(uint256 tokenId) 
        external 
        view 
        returns (TrackInfo memory, address artist) 
    {
        require(_exists(tokenId), "Token does not exist");
        return (_trackInfo[tokenId], _trackArtist[tokenId]);
    }
    
    function getRoyaltyInfo(uint256 tokenId) 
        external 
        view 
        returns (address recipient, uint16 bps) 
    {
        RoyaltyData memory data = _royaltyData[tokenId];
        return (data.recipient, data.bps);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721A)
        returns (bool)
    {
        return interfaceId == _INTERFACE_ID_ERC2981 || ERC721A.supportsInterface(interfaceId);
    }
}
