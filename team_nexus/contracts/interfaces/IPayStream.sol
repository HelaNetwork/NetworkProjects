// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPayStream
 * @notice Interface for the PayStream payroll streaming contract.
 */
interface IPayStream {
    // ──────────────────────────────────────────────
    //  Structs
    // ──────────────────────────────────────────────

    struct Stream {
        address employer;
        address employee;
        uint256 ratePerSecond;
        uint256 lastClaimTime;
        bool active;
    }

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

    // ──────────────────────────────────────────────
    //  Functions
    // ──────────────────────────────────────────────

    function createStream(
        address employee,
        uint256 ratePerSecond
    ) external returns (uint256 streamId);

    function pauseStream(uint256 streamId) external;

    function resumeStream(uint256 streamId) external;

    function cancelStream(uint256 streamId) external;

    function calculateAccrued(
        uint256 streamId
    ) external view returns (uint256);

    function withdraw(uint256 streamId) external;

    function fundContract(uint256 amount) external;

    function getTreasuryBalance() external view returns (uint256);

    function getStream(
        uint256 streamId
    ) external view returns (Stream memory);

    function getStreamCount() external view returns (uint256);
}
