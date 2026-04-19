// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SyncRewards
 * @dev Manages the automated distribution of HLUSD for gamification rewards on the WTF Browser.
 * Controlled by the Python Backend Engine which signs off on valid points redemption.
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SyncRewards {
    address public owner;
    IERC20 public hlusdToken;

    mapping(address => uint256) public totalRewardsClaimed;

    event RewardClaimed(address indexed user, uint256 amount, string activityType);

    constructor(address _hlusdToken) {
        owner = msg.sender;
        hlusdToken = IERC20(_hlusdToken);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the backend engine can execute this");
        _;
    }

    /**
     * @dev Rewards a user directly to their neural tracked wallet ID.
     */
    function distributeReward(address user, uint256 amount, string memory activityType) external onlyOwner {
        require(hlusdToken.balanceOf(address(this)) >= amount, "Insufficient reward pool balance");
        
        totalRewardsClaimed[user] += amount;
        require(hlusdToken.transfer(user, amount), "Token transfer failed");
        
        emit RewardClaimed(user, amount, activityType);
    }

    /**
     * @dev Emergency recovery of the reward pool.
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        hlusdToken.transfer(owner, amount);
    }
}
