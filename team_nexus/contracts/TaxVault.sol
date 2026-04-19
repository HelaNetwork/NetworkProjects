// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TaxVault
 * @notice Holds tax deductions collected from payroll streams (Native Currency).
 * @dev Only the owner (admin) can withdraw accumulated funds.
 */
contract TaxVault is Ownable {

    event TaxDeposited(address indexed from, uint256 amount);
    event TaxWithdrawn(address indexed to, uint256 amount);

    /**
     * @param _admin  Initial owner / admin of the vault.
     */
    constructor(address _admin) Ownable(_admin) {}

    /**
     * @notice Called by PayStream to deposit tax.
     */
    function deposit() external payable {
        require(msg.value > 0, "TaxVault: zero amount");
        emit TaxDeposited(msg.sender, msg.value);
    }

    /**
     * @notice Admin withdraws accumulated tax funds.
     * @param to     Recipient address.
     * @param amount Amount to withdraw.
     */
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "TaxVault: zero address");
        require(amount > 0, "TaxVault: zero amount");
        require(address(this).balance >= amount, "TaxVault: insufficient balance");
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "TaxVault: transfer failed");
        
        emit TaxWithdrawn(to, amount);
    }

    /**
     * @notice Returns the vault's current balance.
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Allow direct deposits
    receive() external payable {
        emit TaxDeposited(msg.sender, msg.value);
    }
}
