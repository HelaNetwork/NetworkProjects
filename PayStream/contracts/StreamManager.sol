// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./YieldVault.sol";

/**
 * @title StreamManager
 * @author PayStream
 * @notice Manages continuous HLUSD payment streams with tax routing,
 *         scheduled bonuses, and gasless EIP-712 meta-transaction withdrawals
 *         on HeLa Testnet.
 * @dev    Inherits OpenZeppelin Ownable for access control and ReentrancyGuard
 *         for withdraw safety. Gas-critical paths use custom errors instead of
 *         revert strings.
 */
contract StreamManager is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // ──────────────────── Custom Errors ──────────────────────

    /// @dev Thrown when a zero address is supplied where one is required.
    error ZeroAddress();
    /// @dev Thrown when a zero amount is supplied where a positive value is required.
    error ZeroAmount();
    /// @dev Thrown when the referenced stream is not active.
    error StreamInactive(uint256 streamId);
    /// @dev Thrown when ratePerSecond is zero or exceeds MAX_RATE.
    error InvalidRate(uint128 rate);
    /// @dev Thrown when taxBps exceeds 10 000 (100 %).
    error InvalidTaxBps(uint32 taxBps);
    /// @dev Thrown when a token transfer or transferFrom fails.
    error TransferFailed();
    /// @dev Thrown when an EIP-712 signature is expired.
    error SignatureExpired();
    /// @dev Thrown when the supplied nonce does not match the on-chain nonce.
    error InvalidNonce();
    /// @dev Thrown when ECDSA recovery does not return the expected employee.
    error InvalidSignature();
    /// @dev Thrown when the sponsorship pool cannot cover a relayer fee.
    error InsufficientSponsorship();
    /// @dev Thrown when there is nothing to withdraw (gross == 0).
    error NothingToWithdraw();
    /// @dev Thrown when batch size is 0 or exceeds MAX_BATCH.
    error InvalidBatchSize();
    /// @dev Thrown when a bonus release time is not in the future.
    error ReleaseInPast();
    /// @dev Thrown when attempting to pause an already-paused stream.
    error AlreadyPaused(uint256 streamId);
    /// @dev Thrown when attempting to resume a stream that is not paused.
    error NotPaused(uint256 streamId);

    // ──────────────────── Constants ──────────────────────────

    /// @notice Maximum streams that can be created in a single batch call
    uint256 public constant MAX_BATCH = 200;

    /// @notice Maximum basis-points value (100 %)
    uint32 public constant MAX_TAX_BPS = 10_000;

    /// @notice Upper-bound sanity check for ratePerSecond (~1 000 HLUSD / s)
    uint128 public constant MAX_RATE = 1_000e18;

    // ───────────────────────── State ─────────────────────────

    /// @notice The HLUSD token used for all payments
    IERC20 public immutable HLUSD;

    /// @notice Address that receives tax withholdings
    address public taxVault;

    /// @notice YieldVault that holds and grows the treasury
    YieldVault public yieldVault;

    /// @notice Auto-incrementing stream identifier
    uint256 public nextStreamId;

    /// @notice Pool used to pay relayer fees on behalf of employees
    uint256 public sponsorshipPool;

    /// @dev Represents a single payment stream
    struct Stream {
        address employee;
        uint128 ratePerSecond;
        uint64 lastCheckpoint;
        uint32 taxBps;
        bool active;
        bool paused;
        uint256 bonusAmount;
        uint64 bonusReleaseTime;
        bool bonusClaimed;
    }

    /// @dev Input for batch stream creation
    struct StreamInput {
        address employee;
        uint128 ratePerSecond;
        uint32 taxBps;
    }

    /// @notice streamId → Stream data
    mapping(uint256 => Stream) public streams;

    // ──────────────────── EIP-712 State ──────────────────────

    /// @notice EIP-712 domain separator (set once in constructor)
    bytes32 public immutable DOMAIN_SEPARATOR;

    /// @notice EIP-712 typehash for WithdrawPayload
    bytes32 public constant WITHDRAW_TYPEHASH =
        keccak256(
            "WithdrawPayload(uint256 streamId,uint256 nonce,uint256 deadline)"
        );

    /// @notice Replay-protection nonce per employee address
    mapping(address => uint256) public nonces;

    // ───────────────────────── Events ────────────────────────

    /// @notice Emitted when the owner deposits HLUSD into the treasury.
    event TreasuryDeposited(address indexed from, uint256 amount);

    /// @notice Emitted when the owner deposits HLUSD into the sponsorship pool.
    event SponsorshipDeposited(address indexed from, uint256 amount);

    /// @notice Emitted when a new stream is created.
    event StreamCreated(uint256 indexed id, address indexed employee);

    /// @notice Emitted when an employee (or relayer) withdraws from a stream.
    event Withdrawn(
        uint256 indexed id,
        address indexed to,
        uint256 gross,
        uint256 tax,
        uint256 net
    );

    /// @notice Emitted on a successful meta-transaction withdrawal.
    event WithdrawnSigned(
        uint256 indexed id,
        address indexed employee,
        address indexed relayer,
        uint256 relayerFee
    );

    /// @notice Emitted when a bonus is scheduled for a stream.
    event BonusScheduled(
        uint256 indexed id,
        uint256 amount,
        uint64 releaseTime
    );

    /// @notice Emitted when a stream is paused by the owner.
    event StreamPaused(uint256 indexed id);

    /// @notice Emitted when a paused stream is resumed by the owner.
    event StreamResumed(uint256 indexed id);

    /// @notice Emitted when a stream is permanently cancelled by the owner.
    event StreamCancelled(uint256 indexed id);

    // ───────────────────── Constructor ───────────────────────

    /**
     * @notice Deploys StreamManager with the given HLUSD token, tax vault,
     *         and yield vault.
     * @param _hlusd      Address of the HLUSD ERC-20 token (non-zero)
     * @param _taxVault   Address that collects tax withholdings (non-zero)
     * @param _yieldVault Address of the YieldVault that manages the treasury
     */
    constructor(address _hlusd, address _taxVault, address _yieldVault) {
        if (_hlusd == address(0)) revert ZeroAddress();
        if (_taxVault == address(0)) revert ZeroAddress();
        if (_yieldVault == address(0)) revert ZeroAddress();
        HLUSD = IERC20(_hlusd);
        taxVault = _taxVault;
        yieldVault = YieldVault(_yieldVault);

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("PayStream")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    // ──────────────────── Public Functions ───────────────────

    /**
     * @notice Deposit HLUSD into the YieldVault treasury for stream payments.
     * @dev    Transfers HLUSD from caller → this contract → YieldVault.
     *        The YieldVault must have StreamManager as its owner.
     * @param amount Amount of HLUSD to deposit (must be > 0)
     */
    function depositTreasury(uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();

        // Pull HLUSD from HR / owner
        if (!HLUSD.transferFrom(msg.sender, address(this), amount))
            revert TransferFailed();

        // Approve and deposit into YieldVault
        HLUSD.approve(address(yieldVault), amount);
        yieldVault.deposit(amount);

        emit TreasuryDeposited(msg.sender, amount);
    }

    /**
     * @notice Deposit HLUSD into the sponsorship pool for relayer fees.
     * @param amount Amount of HLUSD to deposit (must be > 0)
     */
    function depositSponsorshipPool(uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        sponsorshipPool += amount;
        if (!HLUSD.transferFrom(msg.sender, address(this), amount))
            revert TransferFailed();
        emit SponsorshipDeposited(msg.sender, amount);
    }

    /**
     * @notice Create a new payment stream for an employee.
     * @param employee       Recipient address (non-zero)
     * @param ratePerSecond  Payment rate in HLUSD wei per second (0 < rate ≤ MAX_RATE)
     * @param taxBps         Tax withholding in basis points (≤ 10 000)
     */
    function createStream(
        address employee,
        uint128 ratePerSecond,
        uint32 taxBps
    ) external onlyOwner {
        _validateStreamParams(employee, ratePerSecond, taxBps);

        uint256 id = nextStreamId++;
        streams[id] = Stream({
            employee: employee,
            ratePerSecond: ratePerSecond,
            lastCheckpoint: uint64(block.timestamp),
            taxBps: taxBps,
            active: true,
            paused: false,
            bonusAmount: 0,
            bonusReleaseTime: 0,
            bonusClaimed: false
        });

        emit StreamCreated(id, employee);
    }

    /**
     * @notice Create multiple streams in a single transaction.
     * @param inputs Array of StreamInput structs (1 ≤ length ≤ MAX_BATCH)
     */
    function batchCreateStreams(
        StreamInput[] calldata inputs
    ) external onlyOwner {
        uint256 len = inputs.length;
        if (len == 0 || len > MAX_BATCH) revert InvalidBatchSize();

        uint64 checkpoint = uint64(block.timestamp);

        for (uint256 i = 0; i < len; ) {
            StreamInput calldata inp = inputs[i];
            _validateStreamParams(inp.employee, inp.ratePerSecond, inp.taxBps);

            uint256 id = nextStreamId++;
            streams[id] = Stream({
                employee: inp.employee,
                ratePerSecond: inp.ratePerSecond,
                lastCheckpoint: checkpoint,
                taxBps: inp.taxBps,
                active: true,
                paused: false,
                bonusAmount: 0,
                bonusReleaseTime: 0,
                bonusClaimed: false
            });

            emit StreamCreated(id, inp.employee);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Schedule a one-time bonus for a stream, claimable after releaseTime.
     * @param streamId    The stream to attach the bonus to
     * @param amount      Bonus amount in HLUSD (must be > 0)
     * @param releaseTime Unix timestamp when the bonus becomes claimable (future)
     */
    function scheduleBonus(
        uint256 streamId,
        uint256 amount,
        uint64 releaseTime
    ) external onlyOwner {
        Stream storage s = streams[streamId];
        if (!s.active) revert StreamInactive(streamId);
        if (amount == 0) revert ZeroAmount();
        if (releaseTime <= block.timestamp) revert ReleaseInPast();

        s.bonusAmount = amount;
        s.bonusReleaseTime = releaseTime;
        s.bonusClaimed = false;

        emit BonusScheduled(streamId, amount, releaseTime);
    }

    // ───────────────── Lifecycle Management ──────────────────

    /**
     * @notice Pause a stream. While paused, no salary accrues and withdrawals
     *         are blocked. Accrued salary up to this point is settled first.
     * @param streamId The stream to pause
     */
    function pauseStream(uint256 streamId) external onlyOwner {
        Stream storage s = streams[streamId];
        if (!s.active) revert StreamInactive(streamId);
        if (s.paused) revert AlreadyPaused(streamId);

        // Settle accrued amount up to now so nothing is lost
        s.lastCheckpoint = uint64(block.timestamp);
        s.paused = true;

        emit StreamPaused(streamId);
    }

    /**
     * @notice Resume a previously paused stream. The checkpoint resets to now
     *         so that salary does not accrue for the paused period.
     * @param streamId The stream to resume
     */
    function resumeStream(uint256 streamId) external onlyOwner {
        Stream storage s = streams[streamId];
        if (!s.active) revert StreamInactive(streamId);
        if (!s.paused) revert NotPaused(streamId);

        s.lastCheckpoint = uint64(block.timestamp);
        s.paused = false;

        emit StreamResumed(streamId);
    }

    /**
     * @notice Permanently cancel a stream. Cannot be resumed after cancellation.
     * @param streamId The stream to cancel
     */
    function cancelStream(uint256 streamId) external onlyOwner {
        Stream storage s = streams[streamId];
        if (!s.active) revert StreamInactive(streamId);

        s.lastCheckpoint = uint64(block.timestamp);
        s.active = false;

        emit StreamCancelled(streamId);
    }

    // ───────────────── Withdraw Functions ────────────────────

    /**
     * @notice Withdraw accrued salary (and claimable bonus) from a stream.
     *         Only callable when the stream is active and not paused.
     * @param streamId The stream to withdraw from
     */
    function withdraw(uint256 streamId) external nonReentrant {
        _executeWithdraw(streamId);
    }

    /**
     * @notice Gasless withdraw via EIP-712 signature — a relayer submits on
     *         behalf of the employee. An optional relayer fee is paid from the
     *         sponsorship pool (not from the employee's earnings).
     * @param streamId   The stream to withdraw from
     * @param nonce      Must equal nonces[employee]
     * @param deadline   Unix timestamp after which the signature expires
     * @param relayerFee Fee (in HLUSD) paid to msg.sender from sponsorshipPool
     * @param signature  EIP-712 signature produced by the stream's employee
     */
    function withdrawSigned(
        uint256 streamId,
        uint256 nonce,
        uint256 deadline,
        uint256 relayerFee,
        bytes calldata signature
    ) external nonReentrant {
        if (block.timestamp > deadline) revert SignatureExpired();

        Stream storage s = streams[streamId];
        address employee = s.employee;

        // ── Verify nonce ──
        if (nonce != nonces[employee]) revert InvalidNonce();

        // ── EIP-712 digest ──
        bytes32 structHash = keccak256(
            abi.encode(WITHDRAW_TYPEHASH, streamId, nonce, deadline)
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        // ── Recover signer ──
        address signer = digest.recover(signature);
        if (signer != employee) revert InvalidSignature();

        // ── Increment nonce (replay protection) ──
        nonces[employee] = nonce + 1;

        // ── Execute core withdraw ──
        _executeWithdraw(streamId);

        // ── Relayer fee from sponsorship pool ──
        if (relayerFee > 0) {
            if (sponsorshipPool < relayerFee) revert InsufficientSponsorship();
            sponsorshipPool -= relayerFee;
            if (!HLUSD.transfer(msg.sender, relayerFee))
                revert TransferFailed();
        }

        emit WithdrawnSigned(streamId, employee, msg.sender, relayerFee);
    }

    // ──────────────────── View Functions ─────────────────────

    /**
     * @notice Returns the salary accrued since the last checkpoint, excluding bonus.
     * @param streamId The stream to query
     * @return The accrued salary amount in HLUSD wei
     */
    function accruedSalary(uint256 streamId) public view returns (uint256) {
        Stream storage s = streams[streamId];
        uint256 elapsed = block.timestamp - uint256(s.lastCheckpoint);
        return uint256(s.ratePerSecond) * elapsed;
    }

    /**
     * @notice Returns the total YieldVault balance (principal + yield).
     * @return The current treasury balance in HLUSD wei
     */
    function treasuryBalance() public view returns (uint256) {
        return yieldVault.currentBalance();
    }

    /**
     * @notice Returns the net amount withdrawable right now
     *         (salary + claimable bonus − tax on salary & yield gains).
     * @param streamId The stream to query
     * @return The net withdrawable amount in HLUSD wei
     */
    function netWithdrawable(uint256 streamId) public view returns (uint256) {
        Stream storage s = streams[streamId];
        uint256 elapsed = block.timestamp - uint256(s.lastCheckpoint);
        uint256 accrued = uint256(s.ratePerSecond) * elapsed;

        // Tax applies to salary earnings + yield gains, not bonuses
        uint256 tax = (accrued * uint256(s.taxBps)) / 10000;
        uint256 net = accrued - tax;

        if (
            s.bonusAmount > 0 &&
            block.timestamp >= uint256(s.bonusReleaseTime) &&
            !s.bonusClaimed
        ) {
            net += s.bonusAmount;
        }

        return net;
    }

    /**
     * @notice Returns the full Stream struct for a given streamId.
     * @param streamId The stream to query
     * @return The Stream struct as a memory copy
     */
    function streamInfo(uint256 streamId) public view returns (Stream memory) {
        return streams[streamId];
    }

    // ─────────────────── Internal Functions ──────────────────

    /**
     * @dev Validates common stream creation parameters.
     * @param employee      Must not be address(0)
     * @param ratePerSecond Must be > 0 and ≤ MAX_RATE
     * @param taxBps        Must be ≤ MAX_TAX_BPS
     */
    function _validateStreamParams(
        address employee,
        uint128 ratePerSecond,
        uint32 taxBps
    ) internal pure {
        if (employee == address(0)) revert ZeroAddress();
        if (ratePerSecond == 0 || ratePerSecond > MAX_RATE)
            revert InvalidRate(ratePerSecond);
        if (taxBps > MAX_TAX_BPS) revert InvalidTaxBps(taxBps);
    }

    /**
     * @dev Core withdraw logic shared by withdraw() and withdrawSigned().
     *      Computes accrued salary, settles claimable bonus, splits tax
     *      on salary + yield gains (not bonuses), pulls funds from YieldVault,
     *      advances the checkpoint, and transfers HLUSD.
     */
    function _executeWithdraw(uint256 streamId) internal {
        Stream storage s = streams[streamId];
        if (!s.active) revert StreamInactive(streamId);
        if (s.paused) revert AlreadyPaused(streamId);

        // ── Accrued salary ──
        uint256 elapsed = block.timestamp - uint256(s.lastCheckpoint);
        uint256 accrued = uint256(s.ratePerSecond) * elapsed;

        // ── Bonus (one-time, if claimable) ──
        uint256 bonus = 0;
        if (
            s.bonusAmount > 0 &&
            block.timestamp >= uint256(s.bonusReleaseTime) &&
            !s.bonusClaimed
        ) {
            bonus = s.bonusAmount;
            s.bonusClaimed = true;
        }

        uint256 gross = accrued + bonus;
        if (gross == 0) revert NothingToWithdraw();

        // ── Tax split: tax on salary + yield gains, NOT on bonus ──
        uint256 tax = (accrued * uint256(s.taxBps)) / 10000;
        uint256 net = gross - tax;
        uint256 totalPayout = net + tax; // = gross

        // ── Update checkpoint ──
        s.lastCheckpoint = uint64(block.timestamp);

        // ── Pull funds from YieldVault ──
        yieldVault.withdraw(totalPayout, address(this));

        // ── Transfers ──
        if (tax > 0) {
            if (!HLUSD.transfer(taxVault, tax)) revert TransferFailed();
        }
        if (!HLUSD.transfer(s.employee, net)) revert TransferFailed();

        emit Withdrawn(streamId, s.employee, gross, tax, net);
    }
}
