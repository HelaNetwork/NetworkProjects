// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PayStream is Ownable {

    address public taxVault;

    struct Stream {
        address employee;
        uint256 salaryPerSecond;
        uint256 lastWithdrawTime;
        uint256 taxPercent;
        bool isActive;
    }

    uint256 public streamCount;
    mapping(uint256 => Stream) public streams;

    constructor(address _taxVault) Ownable(msg.sender) {
        taxVault = _taxVault;
    }

    // HR starts salary stream
    function startStream(
        address employee,
        uint256 monthlySalaryWei,
        uint256 taxPercent
    ) external onlyOwner {

        require(employee != address(0), "Bad employee");

        uint256 salaryPerSecond = monthlySalaryWei / 30 days;

        streams[++streamCount] = Stream({
            employee: employee,
            salaryPerSecond: salaryPerSecond,
            lastWithdrawTime: block.timestamp,
            taxPercent: taxPercent,
            isActive: true
        });
    }

    // Calculate earned salary
    function accrued(uint256 streamId) public view returns (uint256) {

        Stream memory s = streams[streamId];
        if (!s.isActive) return 0;

        uint256 elapsed = block.timestamp - s.lastWithdrawTime;
        return elapsed * s.salaryPerSecond;
    }

    // Employee withdraws earned ETH
    function withdraw(uint256 streamId) external {

        Stream storage s = streams[streamId];

        require(msg.sender == s.employee, "Not employee");
        require(s.isActive, "Inactive");

        uint256 amount = accrued(streamId);
        require(amount > 0, "Nothing");

        require(address(this).balance >= amount, "Contract empty");

        uint256 tax = (amount * s.taxPercent) / 100;
        uint256 net = amount - tax;

        s.lastWithdrawTime = block.timestamp;

        payable(s.employee).transfer(net);
        payable(taxVault).transfer(tax);
    }

    function pauseStream(uint256 streamId) external onlyOwner {
        streams[streamId].isActive = false;
    }

    // HR funds contract here
    receive() external payable {}

    // emergency withdraw
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
