// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/StreamMath.sol";
import "./TaxVault.sol";

/**
 * @title PayStream
 * @notice Decentralised payroll streaming — employees earn per second,
 *         withdraw anytime, with automatic tax deduction to a vault.
 *         Uses NATIVE CURRENCY (HLUSD/ETH).
 */
contract PayStream is AccessControl, ReentrancyGuard {
    using StreamMath for uint256;

    // ──────────────────────────────────────────────
    //  Roles
    // ──────────────────────────────────────────────

    bytes32 public constant HR_ROLE = keccak256("HR_ROLE");

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    struct Stream {
        address employer;
        address employee;
        uint256 ratePerSecond;
        uint256 lastClaimTime;
        bool active;
        bool isPaused;
    }

    struct StreamRequest {
        address employee;
        uint256 ratePerSecond;
        uint256 timestamp;
        bool processed;
    }

    TaxVault public immutable taxVault;

    /// @notice Tax rate in basis points (1000 = 10%).
    uint256 public taxBasisPoints;

    /// @notice All streams ever created (index = streamId).
    Stream[] public streams;

    /// @notice All stream requests (index = requestId).
    StreamRequest[] public streamRequests;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event StreamCreated(
        uint256 indexed streamId,
        address indexed employer,
        address indexed employee,
        uint256 ratePerSecond
    );
    event StreamPaused(uint256 indexed streamId);
    event StreamResumed(uint256 indexed streamId);
    event StreamCancelled(uint256 indexed streamId);
    event Withdrawal(
        uint256 indexed streamId,
        address indexed employee,
        uint256 employeeAmount,
        uint256 taxAmount
    );
    event TaxRateUpdated(uint256 oldRate, uint256 newRate);
    event ContractFunded(address indexed funder, uint256 amount);
    event StreamRequested(
        uint256 indexed requestId,
        address indexed employee,
        uint256 ratePerSecond
    );
    event StreamRequestApproved(
        uint256 indexed requestId,
        uint256 indexed streamId,
        address indexed employee
    );
    event StreamRequestRejected(uint256 indexed requestId);
    event BonusAwarded(address indexed employee, uint256 amount, uint256 timestamp);

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    /**
     * @param _taxVault       Address of the TaxVault contract.
     * @param _taxBasisPoints Initial tax rate in basis points (e.g. 1000 = 10%).
     */
    constructor(
        TaxVault _taxVault,
        uint256 _taxBasisPoints
    ) {
        require(address(_taxVault) != address(0), "PayStream: zero vault");
        require(_taxBasisPoints <= 10000, "PayStream: tax > 100%");

        taxVault = _taxVault;
        taxBasisPoints = _taxBasisPoints;

        // Deployer gets admin + HR by default
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ROLE, msg.sender);
    }

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────

    modifier streamExists(uint256 streamId) {
        require(streamId < streams.length, "PayStream: stream does not exist");
        _;
    }

    // ──────────────────────────────────────────────
    //  HR Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Create a new salary stream for an employee.
     * @param employee      Employee wallet address.
     * @param ratePerSecond Tokens per second (smallest unit).
     * @return streamId     Index of the newly created stream.
     */
    function createStream(
        address employee,
        uint256 ratePerSecond
    ) external onlyRole(HR_ROLE) returns (uint256 streamId) {
        require(employee != address(0), "PayStream: zero employee");
        require(ratePerSecond > 0, "PayStream: zero rate");

        streamId = streams.length;
        streams.push(
            Stream({
                employer: msg.sender,
                employee: employee,
                ratePerSecond: ratePerSecond,
                lastClaimTime: block.timestamp,
                active: true,
                isPaused: false
            })
        );

        emit StreamCreated(streamId, msg.sender, employee, ratePerSecond);
    }

    /**
     * @notice Pause an active stream (accrual stops).
     * @dev Pending accrued is auto-claimed before pausing.
     */
    function pauseStream(
        uint256 streamId
    ) external streamExists(streamId) {
        Stream storage s = streams[streamId];
        require(
            hasRole(HR_ROLE, msg.sender) || msg.sender == s.employee,
            "PayStream: access denied"
        );
        require(s.active, "PayStream: already paused");

        // Auto-claim pending amount before pausing
        _processWithdrawal(streamId);

        s.active = false;
        s.isPaused = true;
        emit StreamPaused(streamId);
    }

    /**
     * @notice Resume a paused stream.
     */
    function resumeStream(
        uint256 streamId
    ) external onlyRole(HR_ROLE) streamExists(streamId) {
        Stream storage s = streams[streamId];
        require(!s.active, "PayStream: already active");
        require(s.isPaused, "PayStream: stream is cancelled, cannot resume");

        s.lastClaimTime = block.timestamp;
        s.active = true;
        s.isPaused = false;
        emit StreamResumed(streamId);
    }

    /**
     * @notice Cancel a stream permanently. Pending accrued is claimed first.
     */
    function cancelStream(
        uint256 streamId
    ) external onlyRole(HR_ROLE) streamExists(streamId) {
        Stream storage s = streams[streamId];
        require(s.active || s.isPaused, "PayStream: already inactive");

        // Auto-claim pending amount before cancelling
        if (s.active) {
            _processWithdrawal(streamId);
        }

        s.active = false;
        s.isPaused = false; // Permanently stopped
        emit StreamCancelled(streamId);
    }

    /**
     * @notice Update the tax rate (admin only).
     * @param newTaxBasisPoints New rate in basis points.
     */
    function setTaxRate(
        uint256 newTaxBasisPoints
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newTaxBasisPoints <= 10000, "PayStream: tax > 100%");
        uint256 oldRate = taxBasisPoints;
        taxBasisPoints = newTaxBasisPoints;
        emit TaxRateUpdated(oldRate, newTaxBasisPoints);
    }

    /**
     * @notice Request a new salary stream (employee initiates).
     * @param ratePerSecond Desired tokens per second rate.
     * @return requestId Index of the newly created request.
     */
    function requestStreamStart(
        uint256 ratePerSecond
    ) external returns (uint256 requestId) {
        require(ratePerSecond > 0, "PayStream: zero rate");

        requestId = streamRequests.length;
        streamRequests.push(
            StreamRequest({
                employee: msg.sender,
                ratePerSecond: ratePerSecond,
                timestamp: block.timestamp,
                processed: false
            })
        );

        emit StreamRequested(requestId, msg.sender, ratePerSecond);
    }

    /**
     * @notice Approve a pending stream request and create the stream.
     * @param requestId The ID of the request to approve.
     * @return streamId The ID of the newly created stream.
     */
    function approveStreamRequest(
        uint256 requestId
    ) external onlyRole(HR_ROLE) returns (uint256 streamId) {
        require(
            requestId < streamRequests.length,
            "PayStream: request does not exist"
        );
        StreamRequest storage req = streamRequests[requestId];
        require(!req.processed, "PayStream: request already processed");

        // Mark as processed
        req.processed = true;

        // Create the stream
        streamId = streams.length;
        streams.push(
            Stream({
                employer: msg.sender,
                employee: req.employee,
                ratePerSecond: req.ratePerSecond,
                lastClaimTime: block.timestamp,
                active: true,
                isPaused: false
            })
        );

        emit StreamRequestApproved(requestId, streamId, req.employee);
        emit StreamCreated(streamId, msg.sender, req.employee, req.ratePerSecond);
    }

    /**
     * @notice Reject a pending stream request.
     * @param requestId The ID of the request to reject.
     */
    function rejectStreamRequest(
        uint256 requestId
    ) external onlyRole(HR_ROLE) {
        require(
            requestId < streamRequests.length,
            "PayStream: request does not exist"
        );
        StreamRequest storage req = streamRequests[requestId];
        require(!req.processed, "PayStream: request already processed");

        req.processed = true;
        emit StreamRequestRejected(requestId);
    }

    /**
     * @notice Award a one-time bonus to an employee (Feature #1).
     * @param employee The employee address to receive the bonus.
     * @param amount The gross amount of the bonus.
     */
    function awardBonus(
        address employee,
        uint256 amount
    ) external onlyRole(HR_ROLE) nonReentrant {
        require(amount > 0, "PayStream: zero amount");
        // Check treasury balance
        uint256 balance = address(this).balance;
        require(balance >= amount, "PayStream: insufficient treasury");

        (uint256 employeeShare, uint256 taxShare) = StreamMath.splitTax(amount, taxBasisPoints);

        // Transfer employee share
        if (employeeShare > 0) {
            (bool success, ) = payable(employee).call{value: employeeShare}("");
            require(success, "PayStream: transfer failed");
        }

        // Transfer tax share to vault
        if (taxShare > 0) {
            taxVault.deposit{value: taxShare}();
        }
        
        emit BonusAwarded(employee, amount, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  Employee Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Withdraw accrued salary from a stream.
     * @dev Only the stream's employee can call this.
     */
    function withdraw(
        uint256 streamId
    ) external nonReentrant streamExists(streamId) {
        Stream storage s = streams[streamId];
        require(msg.sender == s.employee, "PayStream: not your stream");
        require(s.active, "PayStream: stream inactive");

        _processWithdrawal(streamId);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Calculate accrued (unclaimed) tokens for a stream.
     */
    function calculateAccrued(
        uint256 streamId
    ) external view streamExists(streamId) returns (uint256) {
        Stream storage s = streams[streamId];
        if (!s.active) return 0;
        uint256 elapsed = block.timestamp - s.lastClaimTime;
        return StreamMath.calculateAccrued(s.ratePerSecond, elapsed);
    }

    /**
     * @notice Deposit tokens into the contract treasury for payroll.
     */
    function fundContract() external payable {
        require(msg.value > 0, "PayStream: zero amount");
        emit ContractFunded(msg.sender, msg.value);
    }

    /**
     * @notice Returns the contract's available token balance (treasury).
     */
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get a single stream's data.
     */
    function getStream(
        uint256 streamId
    ) external view streamExists(streamId) returns (Stream memory) {
        return streams[streamId];
    }

    /**
     * @notice Total number of streams created.
     */
    function getStreamCount() external view returns (uint256) {
        return streams.length;
    }

    /**
     * @notice Get a single stream request's data.
     */
    function getRequest(
        uint256 requestId
    ) external view returns (StreamRequest memory) {
        require(
            requestId < streamRequests.length,
            "PayStream: request does not exist"
        );
        return streamRequests[requestId];
    }

    /**
     * @notice Total number of stream requests.
     */
    function getRequestCount() external view returns (uint256) {
        return streamRequests.length;
    }

    /**
     * @notice Get all pending (unprocessed) stream requests.
     */
    function getPendingRequests()
        external
        view
        returns (uint256[] memory requestIds, StreamRequest[] memory requests)
    {
        // Count pending requests
        uint256 pendingCount = 0;
        for (uint256 i = 0; i < streamRequests.length; i++) {
            if (!streamRequests[i].processed) {
                pendingCount++;
            }
        }

        // Allocate arrays
        requestIds = new uint256[](pendingCount);
        requests = new StreamRequest[](pendingCount);

        // Fill arrays
        uint256 index = 0;
        for (uint256 i = 0; i < streamRequests.length; i++) {
            if (!streamRequests[i].processed) {
                requestIds[index] = i;
                requests[index] = streamRequests[i];
                index++;
            }
        }
    }

    // ──────────────────────────────────────────────
    //  Internal
    // ──────────────────────────────────────────────

    /**
     * @dev Core withdrawal logic (checks-effects-interactions).
     *      Calculates accrued → updates lastClaimTime → transfers tokens.
     */
    function _processWithdrawal(uint256 streamId) internal {
        Stream storage s = streams[streamId];
        uint256 elapsed = block.timestamp - s.lastClaimTime;
        if (elapsed == 0) return;

        uint256 grossAmount = StreamMath.calculateAccrued(
            s.ratePerSecond,
            elapsed
        );
        if (grossAmount == 0) return;

        // ── Effects ──
        s.lastClaimTime = block.timestamp;

        // ── Interactions ──
        (uint256 employeeShare, uint256 taxShare) = StreamMath.splitTax(
            grossAmount,
            taxBasisPoints
        );

        // Transfer employee share
        if (employeeShare > 0) {
            (bool success, ) = payable(s.employee).call{value: employeeShare}("");
            require(success, "PayStream: transfer failed");
        }

        // Transfer tax share to vault
        if (taxShare > 0) {
            taxVault.deposit{value: taxShare}();
        }

        emit Withdrawal(streamId, s.employee, employeeShare, taxShare);
    }
    
    // Receive Native Currency (for funding via plain transfers)
    receive() external payable {
        emit ContractFunded(msg.sender, msg.value);
    }
}
