// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract PlaylistNFT is ERC721, Ownable {
    using Strings for uint256;
    using Address for address payable;

    struct Playlist {
        string name;
        string description;
        uint256[] trackIds; // references to MusicNFT tokenIds
        uint256 followerCount;
        uint256 curationFee; // in wei (HLUSD)
        address creator;
    }

    mapping(uint256 => Playlist) private _playlists;
    mapping(uint256 => mapping(address => bool)) private _followers;
    mapping(address => uint256[]) private _userPlaylists;
    
    uint256 private _nextPlaylistId;
    string private _baseTokenURI;
    address public musicNFTContract;

    event PlaylistCreated(uint256 indexed playlistId, address indexed creator, string name);
    event TrackAdded(uint256 indexed playlistId, uint256 trackId);
    event Followed(uint256 indexed playlistId, address indexed follower);
    event CurationFeeUpdated(uint256 indexed playlistId, uint256 newFee);

    constructor(address musicNFT) 
        ERC721("Music Playlist", "PLAY") 
    {
        musicNFTContract = musicNFT;
    }

    function createPlaylist(
        string memory name,
        string memory description,
        uint256[] memory initialTrackIds,
        uint256 curationFee
    ) external returns (uint256) {
        uint256 playlistId = _nextPlaylistId++;
        
        _playlists[playlistId] = Playlist({
            name: name,
            description: description,
            trackIds: initialTrackIds,
            followerCount: 0,
            curationFee: curationFee,
            creator: msg.sender
        });
        
        _safeMint(msg.sender, playlistId);
        _userPlaylists[msg.sender].push(playlistId);
        
        emit PlaylistCreated(playlistId, msg.sender, name);
        return playlistId;
    }

    function addTrack(uint256 playlistId, uint256 trackId) external {
        require(_exists(playlistId), "Playlist does not exist");
        require(ownerOf(playlistId) == msg.sender, "Not playlist owner");
        
        _playlists[playlistId].trackIds.push(trackId);
        emit TrackAdded(playlistId, trackId);
    }

    function followPlaylist(uint256 playlistId) external payable {
        require(_exists(playlistId), "Playlist does not exist");
        require(!_followers[playlistId][msg.sender], "Already following");
        
        Playlist storage playlist = _playlists[playlistId];
        
        if (playlist.curationFee > 0) {
            require(msg.value == playlist.curationFee, "Must pay curation fee");
            (bool success, ) = payable(playlist.creator).call{value: msg.value}("");
            require(success, "Transfer failed");
        }
        
        _followers[playlistId][msg.sender] = true;
        playlist.followerCount++;
        
        emit Followed(playlistId, msg.sender);
    }

    function setCurationFee(uint256 playlistId, uint256 newFee) external {
        require(_exists(playlistId), "Playlist does not exist");
        require(ownerOf(playlistId) == msg.sender, "Not playlist owner");
        
        _playlists[playlistId].curationFee = newFee;
        emit CurationFeeUpdated(playlistId, newFee);
    }

    function getPlaylist(uint256 playlistId) 
        external 
        view 
        returns (
            string memory name,
            string memory description,
            uint256[] memory trackIds,
            uint256 followerCount,
            uint256 curationFee,
            address creator
        ) 
    {
        Playlist memory p = _playlists[playlistId];
        return (p.name, p.description, p.trackIds, p.followerCount, p.curationFee, p.creator);
    }

    function getUserPlaylists(address user) external view returns (uint256[] memory) {
        return _userPlaylists[user];
    }

    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        require(_exists(tokenId), "URI query for nonexistent token");
        return bytes(_baseTokenURI).length > 0 
            ? string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"))
            : "";
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
}
