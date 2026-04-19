// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.3/contracts/access/Ownable.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.3/contracts/security/ReentrancyGuard.sol";

contract PayStreamVault is Ownable, ReentrancyGuard {

    // ===============================
    // CONSTANTS
    // ===============================

    uint256 constant SECONDS_IN_MONTH = 30 days;
    uint256 constant PRECISION = 1e18;

    // ===============================
    // STATE VARIABLES
    // ===============================

    address public taxVault;

    uint256 public totalActiveStreams;
    uint256 public totalAccruedLiability;

    struct Stream {
        uint256 monthlySalary;
        uint256 salaryPerSecond;
        uint256 startTime;
        uint256 endTime;
        uint256 cliffDuration;
        uint256 lastWithdrawTime;
        uint256 accrued;
        uint256 taxPercent;
        bool active;
    }

    mapping(address => Stream) public streams;

    // ===============================
    // EVENTS
    // ===============================

    event TreasuryFunded(address indexed from, uint256 amount);

    event StreamStarted(
        address indexed employee,
        uint256 monthlySalary,
        uint256 startTime,
        uint256 endTime
    );

    event Withdrawn(
        address indexed employee,
        uint256 employeeAmount,
        uint256 taxAmount
    );

    event StreamPaused(address indexed employee);

    event StreamCancelled(address indexed employee);

    event BonusPaid(address indexed employee, uint256 amount);

    event EmergencyWithdraw(uint256 amount);

    event TaxVaultUpdated(address newVault);

    // ===============================
    // CONSTRUCTOR
    // ===============================

    constructor(address _taxVault) {
        require(_taxVault != address(0), "Invalid tax vault");
        taxVault = _taxVault;
    }

    // ===============================
    // TREASURY FUNCTIONS
    // ===============================

    /// @notice Automatically receive native HLUSD
    receive() external payable {
        require(msg.value > 0, "No funds sent");

        emit TreasuryFunded(msg.sender, msg.value);
    }

    /// @notice Explicit treasury deposit by owner
    function depositTreasury()
        external
        payable
        onlyOwner
    {
        require(msg.value > 0, "No funds sent");

        emit TreasuryFunded(msg.sender, msg.value);
    }

    function treasuryBalance()
        public
        view
        returns (uint256)
    {
        return address(this).balance;
    }

    // ===============================
    // STREAM MANAGEMENT
    // ===============================

    function startStream(
        address employee,
        uint256 monthlySalary,
        uint256 taxPercent,
        uint256 duration,
        uint256 cliffDuration
    )
        external
        onlyOwner
    {
        require(employee != address(0), "Invalid employee");

        Stream storage s = streams[employee];


        if (!s.active && s.monthlySalary > 0) {

            require(block.timestamp < s.endTime,
                "Stream already finished");

            s.lastWithdrawTime = block.timestamp;
            s.active = true;

            totalActiveStreams++;

            emit StreamStarted(
                employee,
                s.monthlySalary,
                s.startTime,
                s.endTime
            );

            return;
        }


        require(!s.active, "Stream already active");
        require(monthlySalary > 0, "Invalid salary");
        require(taxPercent <= 50, "Tax too high");
        require(duration > 0, "Invalid duration");

        uint256 salaryPerSecond =
            (monthlySalary * PRECISION) / SECONDS_IN_MONTH;

        streams[employee] = Stream({
            monthlySalary: monthlySalary,
            salaryPerSecond: salaryPerSecond,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            cliffDuration: cliffDuration,
            lastWithdrawTime: block.timestamp,
            accrued: 0,
            taxPercent: taxPercent,
            active: true
        });

        totalActiveStreams++;

        emit StreamStarted(
            employee,
            monthlySalary,
            block.timestamp,
            block.timestamp + duration
        );
    }

    function pauseStream(address employee)
        external
        onlyOwner
    {
        Stream storage s = streams[employee];

        require(s.active, "Stream not active");

        uint256 pending = _calculateEarned(employee);
        s.accrued += pending;

        s.active = false;

        totalActiveStreams--;

        emit StreamPaused(employee);
    }

    function cancelStream(address employee)
        external
        onlyOwner
    {
        Stream storage s = streams[employee];

        require(s.active,
            "Stream not active");

        uint256 pending =
            _calculateEarned(employee);

        s.accrued += pending;

        s.active = false;

        totalActiveStreams--;

        emit StreamCancelled(employee);
    }

    // ===============================
    // VIEW FUNCTIONS
    // ===============================

    function earned(address employee)
        public
        view
        returns (uint256)
    {
        return
            streams[employee].accrued +
            _calculateEarned(employee);
    }

    function _calculateEarned(address employee)
        internal
        view
        returns (uint256)
    {
        Stream memory s = streams[employee];

        if (!s.active)
            return 0;

        if (block.timestamp <
            s.startTime + s.cliffDuration)
            return 0;

        uint256 currentTime =
            block.timestamp > s.endTime
            ? s.endTime
            : block.timestamp;

        if (currentTime <= s.lastWithdrawTime)
            return 0;

        uint256 timeElapsed =
            currentTime - s.lastWithdrawTime;

        return
            (timeElapsed *
            s.salaryPerSecond)
            / PRECISION;
    }

    // ===============================
    // WITHDRAW FUNCTION
    // ===============================

    function withdraw()
        external
        nonReentrant
    {
        Stream storage s =
            streams[msg.sender];

        uint256 amount =
            s.accrued +
            _calculateEarned(msg.sender);

        require(amount > 0,
            "Nothing to withdraw");

        require(
            address(this).balance >= amount,
            "Insufficient treasury"
        );

        s.accrued = 0;

        s.lastWithdrawTime =
            block.timestamp;

        uint256 taxAmount =
            (amount * s.taxPercent)
            / 100;

        uint256 employeeAmount =
            amount - taxAmount;

        // Send employee payment
        (bool success1, ) =
            payable(msg.sender)
            .call{value: employeeAmount}("");

        require(success1,
            "Employee transfer failed");

        // Send tax payment
        (bool success2, ) =
            payable(taxVault)
            .call{value: taxAmount}("");

        require(success2,
            "Tax transfer failed");

        emit Withdrawn(
            msg.sender,
            employeeAmount,
            taxAmount
        );
    }

    // ===============================
    // BONUS FUNCTION
    // ===============================

    function payBonus(
        address employee
    )
        external
        payable
        onlyOwner
    {
        require(employee != address(0),
            "Invalid employee");

        require(msg.value > 0,
            "Invalid bonus");

        (bool success, ) =
            payable(employee)
            .call{value: msg.value}("");

        require(success,
            "Bonus transfer failed");

        emit BonusPaid(
            employee,
            msg.value
        );
    }

    // ===============================
    // EMERGENCY FUNCTION
    // ===============================

    function emergencyWithdraw(
        uint256 amount
    )
        external
        onlyOwner
    {
        require(
            address(this).balance >= amount,
            "Insufficient balance"
        );

        (bool success, ) =
            payable(owner())
            .call{value: amount}("");

        require(success,
            "Emergency withdraw failed");

        emit EmergencyWithdraw(amount);
    }

    // ===============================
    // ADMIN CONFIG
    // ===============================

    function updateTaxVault(
        address newVault
    )
        external
        onlyOwner
    {
        require(
            newVault != address(0),
            "Invalid address"
        );

        taxVault = newVault;

        emit TaxVaultUpdated(newVault);
    }
}
