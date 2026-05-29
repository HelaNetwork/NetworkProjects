// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CreatorToken.sol";
import "./ContentNFT.sol";

contract SubscriptionManager is Ownable {
    CreatorToken public token;
    ContentNFT public nft;

    uint256 public constant MONTHLY_FEE = 0.05 ether;
    uint256 public constant SUBSCRIPTION_PERIOD = 30 days;

    struct Subscription {
        uint256 nextPaymentDue;
        bool isActive;
        uint256 tokenId;
    }

    mapping(address => Subscription) public subscriptions;

    event Subscribed(address indexed subscriber, uint256 tokenId);
    event SubscriptionRenewed(address indexed subscriber, uint256 nextPaymentDue);
    event CreatorWithdrew(uint256 amount);

    constructor(address _token, address _nft) {
        token = CreatorToken(_token);
        nft = ContentNFT(_nft);
    }

    function subscribe() external payable {
        require(msg.value == MONTHLY_FEE, "Incorrect subscription fee");
        
        Subscription storage sub = subscriptions[msg.sender];
        require(!sub.isActive || block.timestamp > sub.nextPaymentDue, "Already active");

        uint256 tokenId;
        if (!sub.isActive && sub.tokenId == 0) {
            tokenId = nft.mintAccess(msg.sender);
            sub.tokenId = tokenId;
        } else {
            tokenId = sub.tokenId;
        }

        sub.isActive = true;
        sub.nextPaymentDue = block.timestamp + SUBSCRIPTION_PERIOD;

        token.mint(msg.sender, 100 * 10**18);

        emit Subscribed(msg.sender, tokenId);
    }

    function renew() external payable {
        require(msg.value == MONTHLY_FEE, "Incorrect subscription fee");
        Subscription storage sub = subscriptions[msg.sender];
        require(sub.isActive, "Not subscribed");

        if (block.timestamp > sub.nextPaymentDue) {
            sub.nextPaymentDue = block.timestamp + SUBSCRIPTION_PERIOD;
        } else {
            sub.nextPaymentDue += SUBSCRIPTION_PERIOD;
        }

        emit SubscriptionRenewed(msg.sender, sub.nextPaymentDue);
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
        emit CreatorWithdrew(balance);
    }
}
