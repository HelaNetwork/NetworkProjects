// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PrivacyPool
 * @notice A shared contract that holds funds for all merchants.
 *         StealthVaults deposit HUSD here identified only by invoiceId.
 *         Merchants withdraw later in a completely separate transaction,
 *         making it impossible to link a customer payment to a merchant.
 *
 *  Flow:
 *    TX 1 (customer pays):
 *      client --> vault.deposit()   (customer -> vault)
 *      vault  --> pool.deposit()    (vault -> pool)
 *
 *    TX 2 (merchant claims, separate block):
 *      pool   --> withdraw()        (pool -> merchant)
 */
contract PrivacyPool is ReentrancyGuard, Ownable {

    // ── Types ───────────────────────────────────────────────────
    struct Deposit {
        address merchant;   // who can claim this deposit
        uint256 amount;     // HUSD amount locked in the pool
        uint256 blockNumber;// block at which the deposit was made
        bool    claimed;    // true after the merchant has withdrawn
    }

    // ── State ───────────────────────────────────────────────────
    IERC20  public husd;
    address public router;
    uint256 public withdrawDelay = 0;

    // invoiceId => Deposit
    mapping(bytes32 => Deposit) public deposits;

    // ── Events ──────────────────────────────────────────────────
    event DepositAdded(
        bytes32 indexed invoiceId,
        address indexed vault,
        address indexed merchant,
        uint256 amount
    );
    event WithdrawalCompleted(
        bytes32 indexed invoiceId,
        address indexed merchant,
        uint256 amount
    );

    // ── Constructor ─────────────────────────────────────────────
    /**
     * @param _husd The address of the HUSD stablecoin
     */
    constructor(address _husd) Ownable(msg.sender) {
        require(_husd != address(0), "PrivacyPool: zero HUSD address");
        husd = IERC20(_husd);
    }

    // ── Admin ───────────────────────────────────────────────────
    /**
     * @notice Set the authorized PaymentRouter. Can only be done once by owner.
     */
    function setRouter(address _router) external onlyOwner {
        require(router == address(0), "PrivacyPool: router already set");
        require(_router != address(0), "PrivacyPool: zero router address");
        router = _router;
    }

    modifier onlyRouter() {
        require(msg.sender == router, "PrivacyPool: restricted to router");
        _;
    }

    // ── Core functions ──────────────────────────────────────────

    /**
     * @notice Called by the StealthVault (via the PaymentRouter) to deposit
     *         HUSD into the pool for a specific invoice.
     *
     *         The vault must have already approved the pool to spend `amount` HUSD
     *         (OR the router calls this after the vault has transferred the tokens
     *         to the pool directly — in that case, use recordDeposit instead).
     *
     *         This version uses transferFrom(msg.sender, ...) meaning:
     *         the CALLER (vault or router) must have approved this pool address.
     *
     * @param invoiceId  Unique invoice identifier (bytes32 hash)
     * @param merchant   The merchant address who can later claim the funds
     * @param amount     The amount of HUSD being deposited
     */
    function deposit(
        bytes32 invoiceId,
        address merchant,
        uint256 amount,
        address from
    ) external nonReentrant onlyRouter {
        require(amount > 0,           "PrivacyPool: amount must be > 0");
        require(merchant != address(0), "PrivacyPool: zero merchant");
        require(from != address(0),    "PrivacyPool: zero from");
        require(
            deposits[invoiceId].amount == 0,
            "PrivacyPool: deposit already exists for this invoice"
        );

        // Pull HUSD from the vault (which has approved this pool)
        require(
            husd.transferFrom(from, address(this), amount),
            "PrivacyPool: transferFrom failed"
        );

        deposits[invoiceId] = Deposit({
            merchant:    merchant,
            amount:      amount,
            blockNumber: block.number,
            claimed:     false
        });

        emit DepositAdded(invoiceId, msg.sender, merchant, amount);
    }

    /**
     * @notice Called directly by the merchant to release funds.
     *         This is TX 2 — a completely separate transaction from the deposit.
     *         By skipping the PaymentRouter entirely, we further disconnect
     *         the transaction paths.
     *
     * @param invoiceId  The invoice to claim
     */
    function withdraw(bytes32 invoiceId) external nonReentrant {
        Deposit storage d = deposits[invoiceId];

        require(d.amount > 0,           "PrivacyPool: no deposit for this invoice");
        require(!d.claimed,             "PrivacyPool: already claimed");
        require(msg.sender == d.merchant, "PrivacyPool: caller is not the merchant");
        require(
            block.number > d.blockNumber + withdrawDelay,
            "PrivacyPool: withdrawal delay not yet reached"
        );

        address merchant = d.merchant;
        uint256 amount   = d.amount;

        // Mark as claimed before transfer to guard against double withdrawals/reentrancy
        d.claimed = true;

        require(
            husd.transfer(merchant, amount),
            "PrivacyPool: transfer to merchant failed"
        );

        emit WithdrawalCompleted(invoiceId, merchant, amount);
    }

    // ── View helpers ────────────────────────────────────────────
    /**
     * @notice Check how much HUSD is locked for a given invoice.
     */
    function getDeposit(bytes32 invoiceId)
        external view
        returns (
            address merchant,
            uint256 amount,
            uint256 blockNumber,
            bool    claimed
        )
    {
        Deposit storage d = deposits[invoiceId];
        return (d.merchant, d.amount, d.blockNumber, d.claimed);
    }
}
