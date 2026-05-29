// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BrowserRewards is ERC20, Ownable {
    mapping(address => uint256) public pendingRewards;

    event RewardAccrued(address indexed user, uint256 amount, string reason);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor() ERC20("Zen Browser Token", "ZENT") {}

    // The browser's centralized engine or Oracle calls this when users block ads or browse
    function accrueReward(address _user, uint256 _amount, string memory _reason) external onlyOwner {
        pendingRewards[_user] += _amount;
        emit RewardAccrued(_user, _amount, _reason);
    }

    function claimRewards() external {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards to claim");

        pendingRewards[msg.sender] = 0;
        _mint(msg.sender, amount);

        emit RewardClaimed(msg.sender, amount);
    }
}
