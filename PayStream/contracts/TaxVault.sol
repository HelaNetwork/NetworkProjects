// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TaxVault
 * @notice Collects and holds tax withholdings in HLUSD.
 *         Only the owner can withdraw accumulated taxes.
 */
contract TaxVault is Ownable {
    // ───────────────────────── State ─────────────────────────

    /// @notice The HLUSD token used for tax payments
    IERC20 public immutable HLUSD;

    /// @notice Running total of taxes deposited
    uint256 public totalTaxCollected;

    // ───────────────────────── Events ────────────────────────

    event TaxReceived(address indexed from, uint256 amount);
    event TaxWithdrawn(address indexed to, uint256 amount);

    // ───────────────────── Constructor ───────────────────────

    /**
     * @param _hlusd Address of the HLUSD ERC-20 token
     */
    constructor(address _hlusd) {
        require(_hlusd != address(0), "TaxVault: zero HLUSD");
        HLUSD = IERC20(_hlusd);
    }

    // ──────────────────── Public Functions ───────────────────

    /**
     * @notice Deposit tax into the vault via transferFrom.
     * @dev    Caller must have approved this contract for `amount` HLUSD.
     * @param amount Amount of HLUSD to deposit as tax
     */
    function depositTax(uint256 amount) external {
        require(amount > 0, "TaxVault: zero amount");
        totalTaxCollected += amount;
        require(
            HLUSD.transferFrom(msg.sender, address(this), amount),
            "TaxVault: transferFrom failed"
        );
        emit TaxReceived(msg.sender, amount);
    }

    /**
     * @notice Withdraw collected taxes to a specified address.
     * @param to     Recipient of the withdrawn HLUSD
     * @param amount Amount of HLUSD to withdraw
     */
    function withdrawTax(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "TaxVault: zero address");
        require(amount > 0, "TaxVault: zero amount");
        require(HLUSD.transfer(to, amount), "TaxVault: transfer failed");
        emit TaxWithdrawn(to, amount);
    }
}
