// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RewardToken.sol";

contract LearnToEarn is ERC721A, Ownable {
    RewardToken public rewardToken;

    mapping(address => uint256) public userLevel;
    mapping(address => bool) public hasMintedProof;

    event ModuleCompleted(address indexed user, uint256 newLevel);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address _rewardTokenAddress) ERC721A("HelaCompletionProof", "HCP") {
        rewardToken = RewardToken(_rewardTokenAddress);
    }

    // Called when a user completes a task/module
    function completeModule() external {
        userLevel[msg.sender] += 1;
        uint256 rewardAmount = userLevel[msg.sender] * 10 * 10**18; // 10 HLT per level
        
        rewardToken.mint(msg.sender, rewardAmount);
        
        emit ModuleCompleted(msg.sender, userLevel[msg.sender]);
        emit RewardClaimed(msg.sender, rewardAmount);

        // Mint SBT proof if they reach level 3
        if (userLevel[msg.sender] >= 3 && !hasMintedProof[msg.sender]) {
            _mint(msg.sender, 1);
            hasMintedProof[msg.sender] = true;
        }
    }

    // Soulbound token implementation (non-transferable)
    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override {
        super._beforeTokenTransfers(from, to, startTokenId, quantity);
        require(from == address(0), "Tokens are soulbound and cannot be transferred");
    }
}
