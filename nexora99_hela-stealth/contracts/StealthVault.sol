// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title StealthVault
 * @notice A minimal, single-use escrow contract deployed per invoice.
 *         Holds HUSD temporarily so the block explorer shows:
 *         Holds HUSD temporarily so the block explorer shows:
 *           TX1: customer → vault & vault → pool (deposit and forward combined)
 *           TX2: pool → merchant                 (claim)
 *         instead of a direct customer → merchant link.
 */
contract StealthVault {

    IERC20  public immutable husd;
    address public immutable privacyPool;
    uint256 public immutable amount;
    address public immutable router;

    bool public deposited;
    bool public forwarded;

    event Deposited(address indexed from, uint256 amount);
    event ForwardedToPool(address indexed pool, uint256 amount);

    constructor(
        address _husd,
        address _privacyPool,
        uint256 _amount,
        address _router
    ) {
        require(_husd        != address(0), "Vault: zero HUSD");
        require(_privacyPool != address(0), "Vault: zero pool");
        require(_amount      > 0,           "Vault: zero amount");
        require(_router      != address(0), "Vault: zero router");

        husd        = IERC20(_husd);
        privacyPool = _privacyPool;
        amount      = _amount;
        router      = _router;
    }

    /**
     * @notice Customer deposits HUSD into the vault.
     *         The customer must have approved THIS vault address for `amount`.
     * @param from  The customer's address (passed by the router).
     */
    function deposit(address from) external {
        require(msg.sender == router,  "Vault: only router");
        require(!deposited,            "Vault: already deposited");

        deposited = true;
        require(
            husd.transferFrom(from, address(this), amount),
            "Vault: deposit transfer failed"
        );

        emit Deposited(from, amount);
    }

    /**
     * @notice Approve the PrivacyPool to pull the escrowed HUSD.
     *         The router will then call pool.deposit() which uses transferFrom.
     *         Can only be called by the router, after deposit.
     */
    function approvePool() external {
        require(msg.sender == router, "Vault: only router");
        require(deposited,            "Vault: not deposited");
        require(!forwarded,           "Vault: already forwarded");

        forwarded = true;
        // Approve the pool to pull exactly `amount` from this vault
        require(
            husd.approve(privacyPool, amount),
            "Vault: pool approval failed"
        );

        emit ForwardedToPool(privacyPool, amount);
    }
}
