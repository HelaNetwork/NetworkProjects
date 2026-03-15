// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ZapPay {

    address public owner;
    uint256 public dailyLimit = 1000 ether;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public dailyTransferred;
    mapping(address => uint256) public lastTransferDay;

    event Deposited(address indexed user, uint256 amount);
    event TransferDone(address indexed from, address indexed to, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier hasEnoughBalance(uint256 amount) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        _;
    }

    modifier withinDailyLimit(uint256 amount) {
        uint256 today = block.timestamp / 1 days;
        if (lastTransferDay[msg.sender] < today) {
            dailyTransferred[msg.sender] = 0;
            lastTransferDay[msg.sender] = today;
        }
        require(dailyTransferred[msg.sender] + amount <= dailyLimit, "Daily limit exceeded");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        require(msg.value > 0, "Must deposit more than 0");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function transfer(address to, uint256 amount)
        public
        hasEnoughBalance(amount)
        withinDailyLimit(amount)
        returns (bool)
    {
        require(to != address(0), "Invalid recipient");
        require(to != msg.sender, "Cannot send to yourself");
        require(amount > 0, "Amount must be greater than 0");

        balances[msg.sender] -= amount;
        balances[to] += amount;
        dailyTransferred[msg.sender] += amount;

        emit TransferDone(msg.sender, to, amount, block.timestamp);
        return true;
    }

    function withdraw(uint256 amount) public hasEnoughBalance(amount) {
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function getBalance(address user) public view returns (uint256) {
        return balances[user];
    }

    function getRemainingDailyLimit(address user) public view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        if (lastTransferDay[user] < today) return dailyLimit;
        return dailyLimit - dailyTransferred[user];
    }

    function setDailyLimit(uint256 newLimit) public onlyOwner {
        dailyLimit = newLimit;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
