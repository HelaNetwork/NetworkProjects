// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./GuildRegistry.sol";

contract Treasury is Ownable {
    using Address for address payable;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
        mapping(address => bool) confirmedBy;
    }

    GuildRegistry public guildRegistry;
    uint256 public guildId;
    uint256 public requiredConfirmations;
    
    mapping(uint256 => Transaction) private _transactions;
    mapping(address => bool) public isSigner;
    mapping(uint256 => mapping(address => bool)) private _hasConfirmed;
    mapping(GuildRegistry.Role => uint256) public roleSpendingLimit; // in wei
    
    uint256 public transactionCount;
    address[] public signers;

    event Deposit(address indexed sender, uint256 amount);
    event TransactionSubmitted(uint256 indexed txId, address indexed to, uint256 value);
    event TransactionConfirmed(uint256 indexed txId, address indexed signer);
    event TransactionExecuted(uint256 indexed txId);
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    event SpendingLimitSet(GuildRegistry.Role indexed role, uint256 limit);

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    constructor(
        address _guildRegistry,
        uint256 _guildId,
        address[] memory _signers,
        uint256 _requiredConfirmations
    ) {
        guildRegistry = GuildRegistry(_guildRegistry);
        guildId = _guildId;
        requiredConfirmations = _requiredConfirmations;
        
        for (uint256 i = 0; i < _signers.length; i++) {
            isSigner[_signers[i]] = true;
            signers.push(_signers[i]);
        }
    }

    function submitTransaction(
        address to,
        uint256 value,
        bytes memory data
    ) external returns (uint256) {
        require(isSigner[msg.sender] || isGuildAdmin(msg.sender), "Not authorized");
        
        uint256 txId = transactionCount++;
        Transaction storage txn = _transactions[txId];
        txn.to = to;
        txn.value = value;
        txn.data = data;
        txn.confirmations = 0;
        txn.executed = false;
        
        emit TransactionSubmitted(txId, to, value);
        return txId;
    }

    function confirmTransaction(uint256 txId) external {
        require(isSigner[msg.sender] || isGuildAdmin(msg.sender), "Not authorized");
        Transaction storage txn = _transactions[txId];
        require(!_hasConfirmed[txId][msg.sender], "Already confirmed");
        require(!txn.executed, "Transaction already executed");
        
        _hasConfirmed[txId][msg.sender] = true;
        txn.confirmations++;
        
        emit TransactionConfirmed(txId, msg.sender);
    }

    function executeTransaction(uint256 txId) external {
        Transaction storage txn = _transactions[txId];
        require(txn.confirmations >= requiredConfirmations, "Not enough confirmations");
        require(!txn.executed, "Already executed");
        
        // Check spending limit for role
        GuildRegistry.Role role = guildRegistry.getRole(guildId, msg.sender);
        uint256 limit = roleSpendingLimit[role];
        if (limit > 0) {
            require(txn.value <= limit, "Exceeds role spending limit");
        }
        
        txn.executed = true;
        
        if (txn.data.length > 0) {
            (bool success, ) = txn.to.call{value: txn.value}(txn.data);
            require(success, "Transaction failed");
        } else {
            payable(txn.to).sendValue(txn.value);
        }
        
        emit TransactionExecuted(txId);
    }

    function addSigner(address signer) external onlyOwner {
        require(!isSigner[signer], "Already a signer");
        isSigner[signer] = true;
        signers.push(signer);
        emit SignerAdded(signer);
    }

    function removeSigner(address signer) external onlyOwner {
        require(isSigner[signer], "Not a signer");
        isSigner[signer] = false;
        
        // Remove from signers array
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == signer) {
                signers[i] = signers[signers.length - 1];
                signers.pop();
                break;
            }
        }
        
        emit SignerRemoved(signer);
    }

    function setSpendingLimit(GuildRegistry.Role role, uint256 limit) external onlyOwner {
        roleSpendingLimit[role] = limit;
        emit SpendingLimitSet(role, limit);
    }

    function isGuildAdmin(address user) internal view returns (bool) {
        return guildRegistry.getRole(guildId, user) == GuildRegistry.Role.ADMIN;
    }

    function getTransaction(uint256 txId) 
        external 
        view 
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 confirmations
        ) 
    {
        Transaction storage txn = _transactions[txId];
        return (txn.to, txn.value, txn.data, txn.executed, txn.confirmations);
    }

    function getSigners() external view returns (address[] memory) {
        return signers;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
