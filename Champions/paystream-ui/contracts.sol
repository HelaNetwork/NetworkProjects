// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.6/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.6/contracts/security/ReentrancyGuard.sol";

contract PayStream is Ownable, ReentrancyGuard {

    address public taxVault;
    uint256 public taxPercent = 10; // 10%

    struct Stream {
        uint256 ratePerSecond;
        uint256 lastClaim;
        uint256 deposited;
        uint256 withdrawn;
        bool active;
    }

    mapping(address => Stream) public streams;

    event FundsDeposited(uint256 amount);
    event StreamStarted(address indexed employee, uint256 rate, uint256 deposit);
    event StreamPaused(address indexed employee);
    event StreamCancelled(address indexed employee);
    event Claimed(address indexed employee, uint256 net, uint256 tax);

    constructor(address _taxVault) {
        require(_taxVault != address(0), "Bad vault");
        taxVault = _taxVault;
    }

    // ===== ADMIN =====

    function setTaxPercent(uint256 _p) external onlyOwner {
        require(_p <= 30, "Too high");
        taxPercent = _p;
    }

    function setTaxVault(address _v) external onlyOwner {
        taxVault = _v;
    }

    // ===== FUND TREASURY =====

    function depositFunds() external payable onlyOwner {
        require(msg.value > 0, "No value");
        emit FundsDeposited(msg.value);
    }

    // ===== STREAM CONTROL =====

    function startStream(
        address employee,
        uint256 ratePerSecond
    ) external payable onlyOwner {

        require(employee != address(0), "Bad address");
        require(ratePerSecond > 0, "Zero rate");
        require(msg.value > 0, "No deposit");

        Stream storage s = streams[employee];

        s.ratePerSecond = ratePerSecond;
        s.lastClaim = block.timestamp;
        s.deposited += msg.value;
        s.active = true;

        emit StreamStarted(employee, ratePerSecond, msg.value);
    }

    function pauseStream(address emp) external onlyOwner {
        streams[emp].active = false;
        emit StreamPaused(emp);
    }

    function cancelStream(address emp) external onlyOwner {
        streams[emp].active = false;
        emit StreamCancelled(emp);
    }

    // ===== CALCULATIONS =====

    function calculateAccrued(address emp) public view returns (uint256) {
        Stream memory s = streams[emp];
        if (!s.active) return 0;

        uint256 elapsed = block.timestamp - s.lastClaim;
        return elapsed * s.ratePerSecond;
    }

    function availableToClaim(address emp) public view returns (uint256) {
        Stream memory s = streams[emp];

        uint256 accrued = calculateAccrued(emp);
        uint256 remaining = s.deposited - s.withdrawn;

        if (accrued > remaining) accrued = remaining;
        return accrued;
    }

    // ===== CLAIM =====

    function claim() external nonReentrant {

        Stream storage s = streams[msg.sender];
        require(s.ratePerSecond > 0, "No stream");

        uint256 amount = availableToClaim(msg.sender);
        require(amount > 0, "Nothing");

        s.lastClaim = block.timestamp;
        s.withdrawn += amount;

        uint256 tax = amount * taxPercent / 100;
        uint256 net = amount - tax;

        payable(msg.sender).transfer(net);
        payable(taxVault).transfer(tax);

        emit Claimed(msg.sender, net, tax);
    }

    // ===== VIEW =====

    function treasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
