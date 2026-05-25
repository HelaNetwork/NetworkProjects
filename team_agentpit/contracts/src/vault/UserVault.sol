// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract UserVault {
    
    mapping(address => uint256) public balances;
    address public owner;
    address public executer; // StrategyExecutor.sol
    bool public executionLocked;

    error InsufficientBalance(uint256 requested, uint256 available);
    error Unauthorized();

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);

    constructor(address _owner) {
        owner = _owner;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        _;
    }

    modifier onlyExecuter() {
        if (msg.sender != executer) {
            revert Unauthorized();
        }
        _;
    }

    function deposit(address token, uint256 amount) external payable onlyOwner {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;

        emit Deposit(msg.sender, token, amount);
    }

    function withdraw(address token, uint256 amount) external onlyOwner {
        if (balances[msg.sender] < amount) {
            revert InsufficientBalance(amount, balances[msg.sender]);
        }
        balances[msg.sender] -= amount;
        IERC20(token).transfer(msg.sender, amount);

        emit Withdraw(msg.sender, token, amount);
    }

    function delegateExecute(address executer, bytes memory data)
        external
        onlyExecuter
        returns (bytes memory)
    {
        executionLocked = true;
        (bool success, bytes memory returnData) = executer.delegatecall(data);
        executionLocked = false;

        require(success, "Delegate call failed");
    }

    function setExecuter(address _executer) external onlyOwner {
        executer = _executer;
    }
    
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

}
