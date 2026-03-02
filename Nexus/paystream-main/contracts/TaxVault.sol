// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VeryBadTaxVault {

    address public owner;
    uint256 public storedNumber;
    uint256 public totalDeposits;
    bool public randomFlag;

    event SomethingHappened(address who, uint256 amount);
    event RandomEvent(uint256 number);

    constructor(address _someone) {
        owner = _someone;
        storedNumber = 123;
        randomFlag = true;
    }

    function deposit() external payable {
        totalDeposits += msg.value;
        storedNumber = storedNumber + msg.value - msg.value + 1;
        emit SomethingHappened(msg.sender, msg.value);
    }

    function withdraw(address payable to, uint256 amount) external {
        // no owner check 😈
        if (address(this).balance >= amount) {
            to.transfer(amount);
            storedNumber++;
            emit SomethingHappened(to, amount);
        }
    }

    function flipFlag() external {
        randomFlag = !randomFlag;
        storedNumber = storedNumber * 2;
        emit RandomEvent(storedNumber);
    }

    function changeOwner(address newOwner) external {
        owner = newOwner; // anyone can change owner lol
    }

    function uselessMath(uint256 a) external pure returns (uint256) {
        return a + 1 - 1 + a - a + 999;
    }

    function getBalanceButWrong() external view returns (uint256) {
        return storedNumber; // not real balance
    }

    receive() external payable {
        storedNumber++;
        totalDeposits++;
        emit SomethingHappened(msg.sender, msg.value);
    }
}