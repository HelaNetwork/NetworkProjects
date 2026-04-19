// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IPayrollTreasury {
    function pullFunds(address to, uint256 amount) external;
}

interface ITaxVault {
    function recordTax(uint256 amount) external;
}

/**
 * @title PayStream
 * @notice Salary streaming contract with deterministic drift-free accrual,
 *         pause/resume, cancel, tax withholding, and batch operations.
 * @dev Uses storage packing: uint64 for timestamps, uint16 for taxBps.
 */
contract PayStream is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Enums ──────────────────────────────────────────────────────────
    enum Status { None, Active, Paused, Canceled }

    // ─── Structs (storage-packed) ───────────────────────────────────────
    // Slot 1: employee (20 bytes) + status (1 byte) + taxBps (2 bytes) = 23 bytes
    // Slot 2: startTime (8) + endTime (8) + pausedAt (8) + totalPaused (8) = 32 bytes
    // Slot 3: ratePerSecond (32 bytes)
    // Slot 4: deposited (32 bytes)
    // Slot 5: withdrawn (32 bytes)
    // Slot 6: remainder (32 bytes)
    struct Stream {
        address employee;
        Status status;
        uint16 taxBps;
        uint64 startTime;
        uint64 endTime;
        uint64 pausedAt;
        uint64 totalPaused;
        uint256 ratePerSecond;
        uint256 deposited;
        uint256 withdrawn;
        uint256 remainder;
    }

    // ─── State ──────────────────────────────────────────────────────────
    IERC20 public immutable hlusd;
    IPayrollTreasury public treasury;
    ITaxVault public taxVault;

    uint16 public defaultTaxBps = 1000; // 10% default

    /// @dev employee address => Stream
    mapping(address => Stream) public streams;
    /// @dev HR role mapping
    mapping(address => bool) public isHR;
    /// @dev list of all employee addresses with streams (for UI enumeration)
    address[] public employees;
    mapping(address => bool) private _hasStream;

    // ─── Events ─────────────────────────────────────────────────────────
    event StreamCreated(
        address indexed employee,
        uint256 totalAmount,
        uint64 startTime,
        uint64 endTime,
        uint256 ratePerSecond,
        uint256 remainder,
        uint16 taxBps
    );
    event StreamPaused(address indexed employee, uint64 pausedAt);
    event StreamResumed(address indexed employee, uint64 resumedAt, uint64 totalPaused);
    event StreamCanceled(address indexed employee, uint256 earnedAtCancel);
    event Withdrawn(address indexed employee, uint256 net, uint256 tax);
    event TaxVaultUpdated(address indexed newTaxVault);
    event TreasuryUpdated(address indexed newTreasury);
    event HRUpdated(address indexed hr, bool status);
    event DefaultTaxBpsUpdated(uint16 newBps);

    // ─── Modifiers ──────────────────────────────────────────────────────
    modifier onlyHR() {
        require(isHR[msg.sender] || msg.sender == owner(), "PayStream: not HR");
        _;
    }

    // ─── Constructor ────────────────────────────────────────────────────
    constructor(
        address _hlusd,
        address _treasury,
        address _taxVault
    ) Ownable(msg.sender) {
        require(_hlusd != address(0), "PayStream: zero token");
        require(_treasury != address(0), "PayStream: zero treasury");
        require(_taxVault != address(0), "PayStream: zero taxVault");
        hlusd = IERC20(_hlusd);
        treasury = IPayrollTreasury(_treasury);
        taxVault = ITaxVault(_taxVault);
    }

    // ─── Admin Functions ────────────────────────────────────────────────
    function setTaxVault(address _taxVault) external onlyOwner {
        require(_taxVault != address(0), "PayStream: zero address");
        taxVault = ITaxVault(_taxVault);
        emit TaxVaultUpdated(_taxVault);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "PayStream: zero address");
        treasury = IPayrollTreasury(_treasury);
        emit TreasuryUpdated(_treasury);
    }

    function setDefaultTaxBps(uint16 _bps) external onlyOwner {
        require(_bps <= 5000, "PayStream: tax > 50%");
        defaultTaxBps = _bps;
        emit DefaultTaxBpsUpdated(_bps);
    }

    function grantHR(address hr) external onlyOwner {
        require(hr != address(0), "PayStream: zero address");
        isHR[hr] = true;
        emit HRUpdated(hr, true);
    }

    function revokeHR(address hr) external onlyOwner {
        isHR[hr] = false;
        emit HRUpdated(hr, false);
    }

    // ─── Stream Creation ────────────────────────────────────────────────

    /**
     * @notice Create a salary stream for an employee.
     * @param employee Recipient address
     * @param totalAmount Total HLUSD to stream
     * @param start Stream start timestamp
     * @param end Stream end timestamp
     * @param _taxBps Tax basis points (0-5000)
     */
    function createStream(
        address employee,
        uint256 totalAmount,
        uint64 start,
        uint64 end,
        uint16 _taxBps
    ) external onlyHR {
        _createStream(employee, totalAmount, start, end, _taxBps);
    }

    /**
     * @notice Batch create streams for multiple employees.
     */
    function batchCreateStreams(
        address[] calldata _employees,
        uint256[] calldata totalAmounts,
        uint64[] calldata starts,
        uint64[] calldata ends,
        uint16[] calldata taxBpsList
    ) external onlyHR {
        uint256 len = _employees.length;
        require(
            len == totalAmounts.length &&
            len == starts.length &&
            len == ends.length &&
            len == taxBpsList.length,
            "PayStream: array mismatch"
        );
        for (uint256 i = 0; i < len; i++) {
            _createStream(_employees[i], totalAmounts[i], starts[i], ends[i], taxBpsList[i]);
        }
    }

    function _createStream(
        address employee,
        uint256 totalAmount,
        uint64 start,
        uint64 end,
        uint16 _taxBps
    ) internal {
        require(employee != address(0), "PayStream: zero employee");
        require(totalAmount > 0, "PayStream: zero amount");
        require(end > start, "PayStream: end <= start");
        require(_taxBps <= 5000, "PayStream: tax > 50%");
        require(
            streams[employee].status == Status.None ||
            streams[employee].status == Status.Canceled,
            "PayStream: stream exists"
        );

        uint256 duration = uint256(end - start);
        uint256 ratePerSecond = totalAmount / duration;
        uint256 remainder = totalAmount % duration;

        require(ratePerSecond > 0, "PayStream: rate is zero");

        // Pull funds from treasury
        treasury.pullFunds(address(this), totalAmount);

        // Track employee
        if (!_hasStream[employee]) {
            employees.push(employee);
            _hasStream[employee] = true;
        }

        streams[employee] = Stream({
            employee: employee,
            status: Status.Active,
            taxBps: _taxBps,
            startTime: start,
            endTime: end,
            pausedAt: 0,
            totalPaused: 0,
            ratePerSecond: ratePerSecond,
            deposited: totalAmount,
            withdrawn: 0,
            remainder: remainder
        });

        emit StreamCreated(employee, totalAmount, start, end, ratePerSecond, remainder, _taxBps);
    }

    // ─── Stream Management ──────────────────────────────────────────────

    function pauseStream(address employee) external onlyHR {
        Stream storage s = streams[employee];
        require(s.status == Status.Active, "PayStream: not active");

        s.pausedAt = uint64(block.timestamp);
        s.status = Status.Paused;

        emit StreamPaused(employee, s.pausedAt);
    }

    function resumeStream(address employee) external onlyHR {
        Stream storage s = streams[employee];
        require(s.status == Status.Paused, "PayStream: not paused");
        require(s.pausedAt > 0, "PayStream: bad pause state");

        uint64 pauseDuration = uint64(block.timestamp) - s.pausedAt;
        s.totalPaused += pauseDuration;
        s.pausedAt = 0;
        s.status = Status.Active;

        emit StreamResumed(employee, uint64(block.timestamp), s.totalPaused);
    }

    function cancelStream(address employee) external onlyHR {
        Stream storage s = streams[employee];
        require(
            s.status == Status.Active || s.status == Status.Paused,
            "PayStream: not active/paused"
        );

        // If paused, finalize the pause duration first
        if (s.status == Status.Paused && s.pausedAt > 0) {
            uint64 pauseDuration = uint64(block.timestamp) - s.pausedAt;
            s.totalPaused += pauseDuration;
            s.pausedAt = 0;
        }

        // Freeze the stream by setting endTime to now
        s.endTime = uint64(block.timestamp);
        
        uint256 earnedAmt = _earned(s);
        s.status = Status.Canceled;

        // Refund unearned to treasury (no remainder on early cancel)
        uint256 refund = s.deposited - earnedAmt;
        if (refund > 0) {
            hlusd.safeTransfer(address(treasury), refund);
        }

        // Update deposited to earned amount (employee can still withdraw)
        s.deposited = earnedAmt;
        // Clear remainder on cancel (not paid out on early termination)
        s.remainder = 0;

        emit StreamCanceled(employee, earnedAmt);
    }

    // ─── Withdraw ───────────────────────────────────────────────────────

    /**
     * @notice Employee withdraws their accrued salary. Tax is split to TaxVault.
     */
    function withdraw() external nonReentrant {
        Stream storage s = streams[msg.sender];
        require(
            s.status == Status.Active ||
            s.status == Status.Paused ||
            s.status == Status.Canceled,
            "PayStream: no stream"
        );

        uint256 earned = _earned(s);

        // Add remainder only at final settlement (stream ended and withdrawing everything)
        bool isFinalSettlement = _isStreamEnded(s) && (earned - s.withdrawn + s.remainder) > 0;
        uint256 totalWithdrawable;
        if (isFinalSettlement) {
            totalWithdrawable = earned + s.remainder - s.withdrawn;
        } else {
            totalWithdrawable = earned - s.withdrawn;
        }

        require(totalWithdrawable > 0, "PayStream: nothing to withdraw");

        // Effects before interactions (CEI)
        s.withdrawn += totalWithdrawable;
        if (isFinalSettlement) {
            s.remainder = 0;
        }

        // Calculate tax
        uint256 taxAmount = (totalWithdrawable * uint256(s.taxBps)) / 10000;
        uint256 netAmount = totalWithdrawable - taxAmount;

        // Interactions
        if (taxAmount > 0) {
            hlusd.safeTransfer(address(taxVault), taxAmount);
            taxVault.recordTax(taxAmount);
        }
        if (netAmount > 0) {
            hlusd.safeTransfer(msg.sender, netAmount);
        }

        emit Withdrawn(msg.sender, netAmount, taxAmount);
    }

    // ─── View Functions ─────────────────────────────────────────────────

    /**
     * @notice Get the earned amount for an employee (without remainder).
     */
    function earned(address employee) external view returns (uint256) {
        return _earned(streams[employee]);
    }

    /**
     * @notice Get the withdrawable amount for an employee (includes remainder at final).
     */
    function withdrawable(address employee) external view returns (uint256) {
        Stream storage s = streams[employee];
        uint256 e = _earned(s);
        bool isFinal = _isStreamEnded(s);
        if (isFinal) {
            uint256 total = e + s.remainder;
            return total > s.withdrawn ? total - s.withdrawn : 0;
        }
        return e > s.withdrawn ? e - s.withdrawn : 0;
    }

    function getStream(address employee) external view returns (Stream memory) {
        return streams[employee];
    }

    function getEmployeeCount() external view returns (uint256) {
        return employees.length;
    }

    function getEmployees() external view returns (address[] memory) {
        return employees;
    }

    // ─── Internal ───────────────────────────────────────────────────────

    /**
     * @dev Deterministic, drift-free earned calculation.
     *      earned = activeElapsed * ratePerSecond
     *      Remainder is NOT included here — only added at final settlement.
     */
    function _earned(Stream storage s) internal view returns (uint256) {
        if (s.status == Status.None) return 0;

        uint64 effectiveNow;
        if (s.status == Status.Paused) {
            effectiveNow = s.pausedAt < s.endTime ? s.pausedAt : s.endTime;
        } else if (s.status == Status.Canceled) {
            // For canceled streams, earned is capped at deposited (set during cancel)
            // Use endTime as cap since we already handled refund
            effectiveNow = uint64(block.timestamp) < s.endTime
                ? uint64(block.timestamp)
                : s.endTime;
        } else {
            effectiveNow = uint64(block.timestamp) < s.endTime
                ? uint64(block.timestamp)
                : s.endTime;
        }

        if (effectiveNow <= s.startTime) return 0;

        uint64 elapsed = effectiveNow - s.startTime;
        uint64 activeElapsed = elapsed > s.totalPaused
            ? elapsed - s.totalPaused
            : 0;

        uint256 e = uint256(activeElapsed) * s.ratePerSecond;

        // Cap at deposited (safety - handles canceled streams)
        if (e > s.deposited) {
            e = s.deposited;
        }

        return e;
    }

    function _isStreamEnded(Stream storage s) internal view returns (bool) {
        if (s.status == Status.None) return false;
        if (s.status == Status.Canceled) return true;

        uint64 effectiveNow;
        if (s.status == Status.Paused) {
            effectiveNow = s.pausedAt;
        } else {
            effectiveNow = uint64(block.timestamp);
        }
        return effectiveNow >= s.endTime;
    }
}
