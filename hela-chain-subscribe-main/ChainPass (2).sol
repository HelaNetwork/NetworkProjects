// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// ─────────────────────────────────────────────────────────────
//  ChainPass — Onchain Subscription + Creator Access NFT
// ─────────────────────────────────────────────────────────────

contract ChainPass {

    // ── State ─────────────────────────────────────────────────
    // NOTE: No string state variables at all — avoids estimateGas
    // failure on HeLa chain caused by string SSTORE in constructor

    address public  creator;
    uint256 public  subscriptionPrice;
    uint256 private _nextTokenId;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;

    // ── Events ────────────────────────────────────────────────

    event Subscribed(address indexed subscriber, uint256 tokenId);
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Withdrawal(address indexed creator, uint256 amount);

    // ── Constructor ───────────────────────────────────────────

    constructor() {
        creator           = msg.sender;
        subscriptionPrice = 0.01 ether;
        _nextTokenId      = 1;
    }

    // ── Metadata (pure — no storage reads) ───────────────────

    function name()   public pure returns (string memory) { return "ChainPass"; }
    function symbol() public pure returns (string memory) { return "CPASS"; }

    // ── Core: Subscribe ───────────────────────────────────────

    function subscribe() external payable {
        require(msg.value >= subscriptionPrice, "Not enough ETH");
        require(balanceOf[msg.sender] == 0,     "Already subscribed");

        uint256 tokenId  = _nextTokenId;
        _nextTokenId     = _nextTokenId + 1;

        ownerOf[tokenId]      = msg.sender;
        balanceOf[msg.sender] = balanceOf[msg.sender] + 1;

        emit Transfer(address(0), msg.sender, tokenId);
        emit Subscribed(msg.sender, tokenId);

        uint256 excess = msg.value - subscriptionPrice;
        if (excess > 0) {
            (bool sent, ) = payable(msg.sender).call{value: excess}("");
            require(sent, "Refund failed");
        }
    }

    // ── Core: Check Access ────────────────────────────────────

    function isSubscribed(address user) external view returns (bool) {
        return balanceOf[user] > 0;
    }

    // ── View helpers ──────────────────────────────────────────

    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ── Creator: Withdraw ─────────────────────────────────────

    function withdraw() external {
        require(msg.sender == creator, "Only creator");
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw");
        (bool sent, ) = payable(creator).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit Withdrawal(creator, amount);
    }

    function setPrice(uint256 newPriceWei) external {
        require(msg.sender == creator, "Only creator");
        subscriptionPrice = newPriceWei;
    }
}
