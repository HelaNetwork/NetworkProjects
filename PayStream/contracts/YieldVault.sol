// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title YieldVault
 * @author PayStream
 * @notice Holds HLUSD principal and simulates yield accrual over time.
 *         The owner can deposit, withdraw (principal + yield), and adjust the
 *         simulated annual yield rate.
 */
contract YieldVault is Ownable {
    // ───────────────────────── Errors ─────────────────────────

    error ZeroAddress();
    error ZeroAmount();
    error InsufficientBalance(uint256 requested, uint256 available);
    error RateTooHigh(uint256 bps);

    // ───────────────────────── State ─────────────────────────

    /// @notice The HLUSD token
    IERC20 public immutable HLUSD;

    /// @notice Total deposited principal (decreases on withdrawals)
    uint256 public totalPrincipal;

    /// @notice Simulated annual yield rate in basis points (e.g. 500 = 5%)
    uint256 public yieldRateBps;

    /// @notice Timestamp of the last yield accrual
    uint256 public lastUpdate;

    /// @notice Yield accumulated but not yet withdrawn
    uint256 public accumulatedYield;

    // ──────────────────── Constants ──────────────────────────

    /// @notice Maximum allowed yield rate: 100% (10 000 bps)
    uint256 public constant MAX_YIELD_BPS = 10_000;

    // ───────────────────────── Events ────────────────────────

    /// @notice Emitted when the owner deposits HLUSD into the vault.
    event Deposit(address indexed from, uint256 amount);

    /// @notice Emitted when the owner withdraws HLUSD from the vault.
    event Withdraw(address indexed to, uint256 amount);

    /// @notice Emitted when yield is accrued via simulateYield().
    event YieldUpdated(uint256 newYield, uint256 totalAccumulated);

    /// @notice Emitted when the yield rate is changed.
    event YieldRateChanged(uint256 oldBps, uint256 newBps);

    // ───────────────────── Constructor ───────────────────────

    /**
     * @param _hlusd Address of the HLUSD ERC-20 token (non-zero)
     */
    constructor(address _hlusd) {
        if (_hlusd == address(0)) revert ZeroAddress();
        HLUSD = IERC20(_hlusd);
        lastUpdate = block.timestamp;
    }

    // ──────────────────── Public Functions ───────────────────

    /**
     * @notice Deposit HLUSD principal into the vault.
     * @dev    Caller must have approved this contract for `amount`.
     * @param amount Amount of HLUSD to deposit (must be > 0)
     */
    function deposit(uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();

        // Accrue any pending yield before changing principal
        _simulateYield();

        totalPrincipal += amount;

        require(
            HLUSD.transferFrom(msg.sender, address(this), amount),
            "YieldVault: transferFrom failed"
        );

        emit Deposit(msg.sender, amount);
    }

    /**
     * @notice Withdraw HLUSD from the vault (yield is consumed first,
     *         then principal).
     * @param amount Amount of HLUSD to withdraw (must be > 0)
     * @param to     Recipient address (non-zero)
     */
    function withdraw(uint256 amount, address to) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        if (to == address(0)) revert ZeroAddress();

        // Accrue latest yield
        _simulateYield();

        uint256 available = totalPrincipal + accumulatedYield;
        if (amount > available) revert InsufficientBalance(amount, available);

        // Deduct from yield first, then principal
        if (amount <= accumulatedYield) {
            accumulatedYield -= amount;
        } else {
            uint256 remainder = amount - accumulatedYield;
            accumulatedYield = 0;
            totalPrincipal -= remainder;
        }

        require(HLUSD.transfer(to, amount), "YieldVault: transfer failed");

        emit Withdraw(to, amount);
    }

    /**
     * @notice Set the simulated annual yield rate.
     * @param bps New yield rate in basis points (≤ 10 000)
     */
    function setYieldRate(uint256 bps) external onlyOwner {
        if (bps > MAX_YIELD_BPS) revert RateTooHigh(bps);

        // Accrue yield at the old rate before switching
        _simulateYield();

        uint256 oldBps = yieldRateBps;
        yieldRateBps = bps;

        emit YieldRateChanged(oldBps, bps);
    }

    // ──────────────────── View Functions ─────────────────────

    /**
     * @notice Returns the current balance: principal + simulated yield
     *         up to this moment (read-only, does not modify state).
     * @return Total available balance in HLUSD wei
     */
    function currentBalance() external view returns (uint256) {
        uint256 pending = _pendingYield();
        return totalPrincipal + accumulatedYield + pending;
    }

    // ─────────────────── Internal Functions ──────────────────

    /**
     * @dev Accrue simulated yield since the last update and persist it.
     *      yield = (totalPrincipal * yieldRateBps / 10000)
     *              * (block.timestamp - lastUpdate) / 365 days
     */
    function _simulateYield() internal {
        uint256 pending = _pendingYield();

        if (pending > 0) {
            accumulatedYield += pending;
            emit YieldUpdated(pending, accumulatedYield);
        }

        lastUpdate = block.timestamp;
    }

    /**
     * @dev Pure calculation of pending yield (no state mutation).
     */
    function _pendingYield() internal view returns (uint256) {
        if (totalPrincipal == 0 || yieldRateBps == 0) return 0;

        uint256 elapsed = block.timestamp - lastUpdate;
        if (elapsed == 0) return 0;

        return (totalPrincipal * yieldRateBps * elapsed) / (10000 * 365 days);
    }
}
