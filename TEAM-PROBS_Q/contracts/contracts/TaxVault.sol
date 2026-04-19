// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TaxVault
 * @notice Receives and holds withheld tax from PayStream withdrawals.
 */
contract TaxVault is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable hlusd;
    uint256 public totalReceived;

    event TaxReceived(address indexed from, uint256 amount);
    event TaxWithdrawn(address indexed to, uint256 amount);

    constructor(address _hlusd) Ownable(msg.sender) {
        require(_hlusd != address(0), "TaxVault: zero token");
        hlusd = IERC20(_hlusd);
    }

    /// @notice Returns current HLUSD balance held in the vault
    function getBalance() external view returns (uint256) {
        return hlusd.balanceOf(address(this));
    }

    /// @notice Called by PayStream to record tax receipt (for tracking)
    function recordTax(uint256 amount) external {
        totalReceived += amount;
        emit TaxReceived(msg.sender, amount);
    }

    /// @notice Owner withdraws accumulated taxes (e.g., to a tax authority)
    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "TaxVault: zero address");
        hlusd.safeTransfer(to, amount);
        emit TaxWithdrawn(to, amount);
    }
}
