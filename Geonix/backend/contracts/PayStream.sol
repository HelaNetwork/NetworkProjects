// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PayStream
 * @notice Real-time salary streaming with tax deduction, pause/resume on HeLa Network
 */
contract PayStream is AccessControl, ReentrancyGuard {
    bytes32 public constant HR_ROLE = keccak256("HR_ROLE");

    struct Stream {
        address employer;
        address employee;
        address token;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 endTime;
        uint256 withdrawnAmount;
        bool active;
        bool paused;
        uint256 pausedTime;        // When stream was paused
        uint256 totalPausedDuration; // Total time paused
    }

    // Tax configuration
    uint256 public taxRate = 100; // 1% = 100 basis points (10000 = 100%)
    address public taxVault;

    // Storage
    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public employeeStreams;
    mapping(address => uint256[]) public employerStreams;
    uint256 public nextStreamId;

    // Events
    event StreamCreated(
        uint256 indexed streamId,
        address indexed employer,
        address indexed employee,
        address token,
        uint256 ratePerSecond,
        uint256 startTime,
        uint256 endTime
    );

    event StreamWithdrawn(
        uint256 indexed streamId,
        address indexed employee,
        uint256 amount,
        uint256 taxAmount
    );

    event StreamCancelled(uint256 indexed streamId);
    
    event StreamPaused(
        uint256 indexed streamId,
        address indexed pausedBy,
        uint256 pausedAt
    );
    
    event StreamResumed(
        uint256 indexed streamId,
        address indexed resumedBy,
        uint256 resumedAt
    );
    
    event TaxRateUpdated(uint256 newRate);
    event TaxVaultUpdated(address newVault);

    constructor(address _taxVault) {
        require(_taxVault != address(0), "Invalid tax vault");
        taxVault = _taxVault;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ROLE, msg.sender);
    }

    /**
     * @notice Create a new salary stream
     */
    function createStream(
        address employee,
        address token,
        uint256 totalAmount,
        uint256 duration
    ) external onlyRole(HR_ROLE) returns (uint256) {
        require(employee != address(0), "Invalid employee");
        require(token != address(0), "Invalid token");
        require(totalAmount > 0, "Amount must be > 0");
        require(duration > 0, "Duration must be > 0");

        uint256 streamId = nextStreamId++;
        uint256 ratePerSecond = totalAmount / duration;
        require(ratePerSecond > 0, "Rate too low");

        streams[streamId] = Stream({
            employer: msg.sender,
            employee: employee,
            token: token,
            ratePerSecond: ratePerSecond,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            withdrawnAmount: 0,
            active: true,
            paused: false,
            pausedTime: 0,
            totalPausedDuration: 0
        });

        employeeStreams[employee].push(streamId);
        employerStreams[msg.sender].push(streamId);

        require(
            IERC20(token).transferFrom(msg.sender, address(this), totalAmount),
            "Transfer failed"
        );

        emit StreamCreated(
            streamId,
            msg.sender,
            employee,
            token,
            ratePerSecond,
            block.timestamp,
            block.timestamp + duration
        );

        return streamId;
    }

    /**
     * @notice Pause an active stream (HR only)
     */
    function pauseStream(uint256 streamId) external {
        Stream storage stream = streams[streamId];
        require(stream.active, "Stream not active");
        require(!stream.paused, "Stream already paused");
        require(
            msg.sender == stream.employer || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );

        stream.paused = true;
        stream.pausedTime = block.timestamp;

        emit StreamPaused(streamId, msg.sender, block.timestamp);
    }

    /**
     * @notice Resume a paused stream (HR only)
     */
    function resumeStream(uint256 streamId) external {
        Stream storage stream = streams[streamId];
        require(stream.active, "Stream not active");
        require(stream.paused, "Stream not paused");
        require(
            msg.sender == stream.employer || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );

        stream.totalPausedDuration += (block.timestamp - stream.pausedTime);
        stream.paused = false;
        stream.pausedTime = 0;

        emit StreamResumed(streamId, msg.sender, block.timestamp);
    }

    /**
     * @notice Withdraw available salary from stream
     */
    function withdraw(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.active, "Stream not active");
        require(!stream.paused, "Stream is paused");
        require(msg.sender == stream.employee, "Not stream recipient");

        uint256 available = _availableBalance(streamId);
        require(available > 0, "No balance available");

        stream.withdrawnAmount += available;

        uint256 taxAmount = (available * taxRate) / 10000;
        uint256 netAmount = available - taxAmount;

        if (taxAmount > 0) {
            require(
                IERC20(stream.token).transfer(taxVault, taxAmount),
                "Tax transfer failed"
            );
        }

        require(
            IERC20(stream.token).transfer(stream.employee, netAmount),
            "Transfer failed"
        );

        emit StreamWithdrawn(streamId, stream.employee, netAmount, taxAmount);
    }

    /**
     * @notice Cancel an active stream
     */
    function cancelStream(uint256 streamId) external {
        Stream storage stream = streams[streamId];
        require(stream.active, "Stream not active");
        require(
            msg.sender == stream.employer || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );

        if (stream.paused) {
            stream.totalPausedDuration += (block.timestamp - stream.pausedTime);
        }

        stream.active = false;

        uint256 available = _availableBalance(streamId);
        uint256 totalAmount = stream.ratePerSecond * 
            (stream.endTime - stream.startTime);
        uint256 remaining = totalAmount - stream.withdrawnAmount - available;

        if (remaining > 0) {
            require(
                IERC20(stream.token).transfer(stream.employer, remaining),
                "Refund failed"
            );
        }

        emit StreamCancelled(streamId);
    }

    /**
     * @notice Get available balance for a stream
     */
    function availableBalance(uint256 streamId) external view returns (uint256) {
        return _availableBalance(streamId);
    }

    /**
     * @dev Internal function to calculate available balance
     */
    function _availableBalance(uint256 streamId) internal view returns (uint256) {
        Stream memory stream = streams[streamId];
        if (!stream.active) return 0;

        uint256 currentTime = block.timestamp;
        
        if (stream.paused) {
            currentTime = stream.pausedTime;
        }

        uint256 elapsed;
        if (currentTime > stream.endTime) {
            elapsed = stream.endTime - stream.startTime - stream.totalPausedDuration;
        } else {
            uint256 totalElapsed = currentTime - stream.startTime;
            elapsed = totalElapsed > stream.totalPausedDuration 
                ? totalElapsed - stream.totalPausedDuration 
                : 0;
        }

        uint256 totalEarned = elapsed * stream.ratePerSecond;
        return totalEarned > stream.withdrawnAmount
            ? totalEarned - stream.withdrawnAmount
            : 0;
    }

    function getEmployeeStreams(address employee) external view returns (uint256[] memory) {
        return employeeStreams[employee];
    }

    function getEmployerStreams(address employer) external view returns (uint256[] memory) {
        return employerStreams[employer];
    }

    function getStream(uint256 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }

    function setTaxRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRate <= 5000, "Tax rate too high");
        taxRate = newRate;
        emit TaxRateUpdated(newRate);
    }

    function setTaxVault(address newVault) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newVault != address(0), "Invalid address");
        taxVault = newVault;
        emit TaxVaultUpdated(newVault);
    }
}
