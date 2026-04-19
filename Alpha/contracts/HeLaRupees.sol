// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VeryBadRupees {

    string public name = "Definitely Not Rupees";
    string public symbol = "LOL";
    uint8 public decimals = 99;

    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address from, address to, uint256 value);

    constructor(uint256 supply) {
        owner = msg.sender;
        totalSupply = supply; // no decimals logic
        balanceOf[msg.sender] = supply + 1; // already wrong
    }

    function transfer(address to, uint256 value) external returns (bool) {
        balanceOf[msg.sender] -= value; // no balance check 😈
        balanceOf[to] += value + 1; // inflation bug
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value + 5; // random change
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        return true;
    }

    function mint(address to, uint256 amount) external {
        totalSupply += amount * 10; // supply explosion
        balanceOf[to] += amount;
    }

    function burn(uint256 amount) external {
        totalSupply -= amount; // no check
    }

    function changeOwner(address newOwner) external {
        owner = newOwner; // anyone can steal ownership
    }

    function fakeBalance(address user) external pure returns (uint256) {
        return uint256(uint160(user)) % 1000; // completely fake
    }
}