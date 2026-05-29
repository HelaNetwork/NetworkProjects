// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract RoyaltySplitter is Ownable {
    using Address for address payable;

    struct Payee {
        address payable addr;
        uint16 bps; // basis points (10000 = 100%)
    }

    Payee[] public payees;
    mapping(address => uint256) public shares; // total shares received
    mapping(address => uint256) public released; // already withdrawn

    uint256 public totalReleased;
    uint256 public totalShares; // sum of all bps

    event PayeeAdded(address indexed account, uint16 bps);
    event PaymentReleased(address indexed to, uint256 amount);
    event PaymentReceived(address indexed from, uint256 amount);

    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }

    constructor() {}

    function addPayee(address payable addr, uint16 bps) external onlyOwner {
        require(addr != address(0), "Invalid address");
        require(bps > 0, "BPS must be > 0");
        require(totalShares + bps <= 10000, "Total BPS exceeds 100%");
        
        payees.push(Payee(addr, bps));
        totalShares += bps;
        
        emit PayeeAdded(addr, bps);
    }

    function release() external {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to distribute");
        
        for (uint256 i = 0; i < payees.length; i++) {
            Payee memory payee = payees[i];
            uint256 amount = (balance * payee.bps) / 10000;
            
            if (amount > 0) {
                shares[payee.addr] += amount;
                released[payee.addr] += amount;
                totalReleased += amount;
                
                payee.addr.sendValue(amount);
                emit PaymentReleased(payee.addr, amount);
            }
        }
    }

    function withdraw() external {
        uint256 amount = shares[msg.sender] - released[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        released[msg.sender] += amount;
        totalReleased += amount;
        
        payable(msg.sender).sendValue(amount);
        emit PaymentReleased(msg.sender, amount);
    }

    function getPayees() external view returns (Payee[] memory) {
        return payees;
    }

    function totalPayees() external view returns (uint256) {
        return payees.length;
    }

    function pendingPayment(address account) external view returns (uint256) {
        return shares[account] - released[account];
    }
}
