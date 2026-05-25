// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./StealthRegistry.sol";
import "./FeeManager.sol";
import "./StealthVault.sol";
import "./PrivacyPool.sol";

/**
 * @title PaymentRouter
 * @notice Creates one-time stealth payment vaults, routes HUSD payments
 *         through temporary escrow contracts so the block explorer shows
 *         two separate transfers instead of a direct client→merchant link.
 */
contract PaymentRouter is ReentrancyGuard {

    // ── Types ──────────────────────────────────────────────
    enum InvoiceStatus { Active, Paid, Claimed, Cancelled }

    struct Invoice {
        bytes32        id;
        address        merchant;
        uint256        amount;          // HUSD amount (18 dec)
        InvoiceStatus  status;
        address        payer;
        uint256        createdAt;
        uint256        paidAt;
        uint256        nonce;           // replay-attack guard
        address        vault;           // one-time StealthVault address
    }

    // ── State ──────────────────────────────────────────────
    IERC20          public husd;
    StealthRegistry public registry;
    FeeManager      public feeManager;
    PrivacyPool     public pool;

    uint256 private _invoiceNonce;

    mapping(bytes32 => Invoice) public invoices;
    mapping(address => bytes32[]) public merchantInvoices;

    // ── Events ─────────────────────────────────────────────
    event InvoiceCreated(
        bytes32 indexed invoiceId,
        address indexed merchant,
        uint256 amount,
        uint256 nonce,
        uint256 timestamp,
        address vault
    );
    event PaymentProcessed(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed merchant,
        uint256 amount,
        uint256 timestamp,
        address vault
    );
    event InvoiceClaimed(
        bytes32 indexed invoiceId,
        address indexed merchant,
        uint256 amount,
        uint256 timestamp,
        address vault
    );
    event InvoiceCancelled(bytes32 indexed invoiceId, uint256 timestamp);

    // ── Constructor ────────────────────────────────────────
    constructor(
        address _husd,
        address _registry,
        address _feeManager,
        address _pool
    ) {
        require(_husd       != address(0), "Router: zero HUSD");
        require(_registry   != address(0), "Router: zero registry");
        require(_feeManager != address(0), "Router: zero feeManager");
        require(_pool       != address(0), "Router: zero pool");

        husd       = IERC20(_husd);
        registry   = StealthRegistry(_registry);
        feeManager = FeeManager(_feeManager);
        pool       = PrivacyPool(_pool);
    }

    // ── Merchant creates a payment invoice ─────────────────
    /**
     * @notice Generate a one-time payment invoice with a dedicated StealthVault.
     * @param amount  HUSD amount the customer must pay.
     * @return invoiceId  Unique identifier for this invoice.
     */
    function createInvoice(uint256 amount) external nonReentrant returns (bytes32 invoiceId) {
        require(registry.isMerchant(msg.sender), "Router: not a merchant");
        require(amount > 0, "Router: zero amount");

        // Charge protocol fee
        uint256 fee = feeManager.protocolFee();
        if (fee > 0) {
            require(
                husd.transferFrom(msg.sender, feeManager.treasury(), fee),
                "Router: fee transfer failed"
            );
        }

        _invoiceNonce++;
        invoiceId = keccak256(
            abi.encodePacked(msg.sender, amount, _invoiceNonce, block.timestamp)
        );

        // Deploy a one-time StealthVault for this invoice
        StealthVault vault = new StealthVault(
            address(husd),
            address(pool),  // vault sends funds to the pool, NOT the merchant
            amount,
            address(this)   // only this router can trigger deposit/forward
        );

        invoices[invoiceId] = Invoice({
            id:        invoiceId,
            merchant:  msg.sender,
            amount:    amount,
            status:    InvoiceStatus.Active,
            payer:     address(0),
            createdAt: block.timestamp,
            paidAt:    0,
            nonce:     _invoiceNonce,
            vault:     address(vault)
        });

        merchantInvoices[msg.sender].push(invoiceId);

        emit InvoiceCreated(invoiceId, msg.sender, amount, _invoiceNonce, block.timestamp, address(vault));
    }

    // ── Customer pays an invoice ───────────────────────────
    /**
     * @notice Pay an active invoice with HUSD via the StealthVault.
     *         The customer must have approved the vault address for HUSD spending.
     *         This executes the first hop: customer → vault
     * @param invoiceId  The invoice to pay.
     */
    function payInvoice(bytes32 invoiceId) external nonReentrant {
        Invoice storage inv = invoices[invoiceId];

        require(inv.merchant != address(0),          "Router: invoice not found");
        require(inv.status == InvoiceStatus.Active,  "Router: invoice not active");
        require(msg.sender != inv.merchant,          "Router: self-pay blocked");

        StealthVault vault = StealthVault(inv.vault);

        // Step 1: Pull HUSD from customer into the vault
        vault.deposit(msg.sender);

        // Step 2: Vault approves the pool to pull HUSD via transferFrom
        vault.approvePool();

        // Step 3: Pool pulls HUSD from the vault — records merchant, amount, blockNumber
        pool.deposit(invoiceId, inv.merchant, inv.amount, inv.vault);

        // Mark invoice as paid
        inv.status = InvoiceStatus.Paid;
        inv.payer  = msg.sender;
        inv.paidAt = block.timestamp;

        emit PaymentProcessed(invoiceId, msg.sender, inv.merchant, inv.amount, block.timestamp, inv.vault);
    }

    // ── Merchant claims an invoice ─────────────────────────
    /**
     * @notice Releases funds from the PrivacyPool to the merchant.
     *         This executes the second hop: pool → merchant in a separate transaction.
     * @param invoiceId  The invoice to claim.
     */
    function claimInvoice(bytes32 invoiceId) external nonReentrant {
        Invoice storage inv = invoices[invoiceId];

        require(inv.merchant != address(0),          "Router: invoice not found");
        require(inv.status == InvoiceStatus.Paid,    "Router: invoice not paid");

        // Step 4: Pool releases HUSD to the merchant (merchant info stored in pool struct)
        pool.withdraw(invoiceId);

        // Mark invoice as claimed
        inv.status = InvoiceStatus.Claimed;

        emit InvoiceClaimed(invoiceId, inv.merchant, inv.amount, block.timestamp, inv.vault);
    }

    // ── Merchant cancels an invoice ────────────────────────
    function cancelInvoice(bytes32 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];
        require(inv.merchant == msg.sender,         "Router: not your invoice");
        require(inv.status == InvoiceStatus.Active, "Router: not active");

        inv.status = InvoiceStatus.Cancelled;
        emit InvoiceCancelled(invoiceId, block.timestamp);
    }

    // ── View helpers ───────────────────────────────────────
    function getInvoice(bytes32 invoiceId)
        external view
        returns (
            address merchant,
            uint256 amount,
            InvoiceStatus status,
            address payer,
            uint256 createdAt,
            uint256 paidAt,
            address vault
        )
    {
        Invoice storage inv = invoices[invoiceId];
        return (inv.merchant, inv.amount, inv.status, inv.payer, inv.createdAt, inv.paidAt, inv.vault);
    }

    function getMerchantInvoiceCount(address merchant) external view returns (uint256) {
        return merchantInvoices[merchant].length;
    }

    function getMerchantInvoiceAt(address merchant, uint256 idx) external view returns (bytes32) {
        return merchantInvoices[merchant][idx];
    }
}
