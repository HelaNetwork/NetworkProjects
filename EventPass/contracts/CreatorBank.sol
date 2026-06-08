// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CreatorBank is Ownable {
    mapping(address => uint256) public balances;

    event Deposited(address indexed creator, uint256 amount);
    event Withdrawn(address indexed creator, uint256 amount);

    function deposit(address creator) external payable {
        balances[creator] += msg.value;
        emit Deposited(creator, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }
}
