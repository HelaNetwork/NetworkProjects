// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC8004 {
    struct Agent {
        uint256 creditScore;
        uint256 totalTasks;
        uint256 successfulTasks;
        uint256 stake;
        bool active;
        string metadataURI; // 👈 off-chain metadata
    }

    function register() external payable;

    function getAgent(address agent) external view returns (Agent memory);

    function getScore(address agent) external view returns (uint256);

    function getSuccessRate(address agent) external view returns (uint256);

    function isActive(address agent) external view returns (bool);

    function updateScore(address agent, bool success) external;

    function setAgentURI(string calldata uri) external;
}