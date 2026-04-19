// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HeLaRupees {
    // ============================================
    // STORAGE — Packed into minimal slots
    // ============================================
    
    // Slot 0: owner (20 bytes) + decimals (1 byte) = 21 bytes, 1 slot
    address public owner;
    uint8 public constant decimals = 18;

    // Slot 1: totalSupply
    uint256 public totalSupply;

    // Slot 2+: mappings (each gets own slot via hash)
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Constants — stored in bytecode, NOT storage (zero gas to read)
    string public constant name = "HeLa Rupees";
    string public constant symbol = "HRS";

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Custom errors — cheaper than require strings
    error InsufficientBalance();
    error InsufficientAllowance();
    error ZeroAddress();
    error NotOwner();

    constructor(uint256 initialSupply) {
        owner = msg.sender;
        uint256 supply = initialSupply * 1e18;
        totalSupply = supply;
        balanceOf[msg.sender] = supply;
        emit Transfer(address(0), msg.sender, supply);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        if (to == address(0)) revert ZeroAddress();
        uint256 senderBal = balanceOf[msg.sender];
        if (senderBal < value) revert InsufficientBalance();
        unchecked {
            balanceOf[msg.sender] = senderBal - value;
            balanceOf[to] += value; // Can't overflow: totalSupply is finite
        }
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        if (to == address(0)) revert ZeroAddress();
        
        uint256 bal = balanceOf[from];
        if (bal < value) revert InsufficientBalance();
        
        uint256 allowed = allowance[from][msg.sender];
        if (allowed < value) revert InsufficientAllowance();
        
        unchecked {
            balanceOf[from] = bal - value;
            balanceOf[to] += value;
            if (allowed != type(uint256).max) {
                allowance[from][msg.sender] = allowed - value;
            }
        }
        emit Transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != owner) revert NotOwner();
        if (to == address(0)) revert ZeroAddress();
        totalSupply += amount;
        unchecked {
            balanceOf[to] += amount;
        }
        emit Transfer(address(0), to, amount);
    }
}