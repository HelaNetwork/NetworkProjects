// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentRegistery is ERC721, Ownable {
    uint256 private _tokenIds;

    struct Agent {
        uint256 creditScore;
        uint256 totalTasks;
        uint256 successfulTasks;
        uint256 stake;
        bool active;
        string metadataURI;
    }

    mapping(uint256 => Agent) private agents;

    event AgentRegistered(uint256 indexed tokenId, address indexed owner, uint256 stake);
    event ScoreUpdated(uint256 indexed tokenId, uint256 newScore);
    event StakeAdded(uint256 indexed tokenId, uint256 amount);
    event MetadataUpdated(uint256 indexed tokenId, string uri);

    error NotOwner();
    error NotActive();

    constructor() ERC721("AI Agent", "AIA") Ownable() {}


    function register() external payable returns (uint256) {
        _tokenIds++;
        uint256 tokenId = _tokenIds;

        _mint(msg.sender, tokenId);

        agents[tokenId] = Agent({
            creditScore: 100,
            totalTasks: 0,
            successfulTasks: 0,
            stake: msg.value,
            active: true,
            metadataURI: ""
        });

        emit AgentRegistered(tokenId, msg.sender, msg.value);
        return tokenId;
    }
    modifier onlyAgentOwner(uint256 tokenId) {
        if (ownerOf(tokenId) != msg.sender) revert NotOwner();
        _;
    }


    function addStake(uint256 tokenId) external payable onlyAgentOwner(tokenId) {
        agents[tokenId].stake += msg.value;
        emit StakeAdded(tokenId, msg.value);
    }

    function updateScore(uint256 tokenId, bool success) external onlyOwner {
        Agent storage a = agents[tokenId];

        if (!a.active) revert NotActive();

        a.totalTasks++;

        if (success) {
            a.successfulTasks++;
            a.creditScore += 5;
        } else {
            if (a.creditScore > 5) {
                a.creditScore -= 5;
            }
        }

        emit ScoreUpdated(tokenId, a.creditScore);
    }


    function setAgentURI(uint256 tokenId, string calldata uri)
        external
        onlyAgentOwner(tokenId)
    {
        agents[tokenId].metadataURI = uri;
        emit MetadataUpdated(tokenId, uri);
    }


    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return agents[tokenId].metadataURI;
    }


    function getAgent(uint256 tokenId) external view returns (Agent memory) {
        return agents[tokenId];
    }

    function getScore(uint256 tokenId) external view returns (uint256) {
        return agents[tokenId].creditScore;
    }

    function getSuccessRate(uint256 tokenId) external view returns (uint256) {
        Agent memory a = agents[tokenId];
        if (a.totalTasks == 0) return 0;
        return (a.successfulTasks * 100) / a.totalTasks;
    }

    function isActive(uint256 tokenId) external view returns (bool) {
        return agents[tokenId].active;
    }
}