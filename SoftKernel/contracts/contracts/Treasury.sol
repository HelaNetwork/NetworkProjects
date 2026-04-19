// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @title Treasury
 * @notice Custody contract for native HLUSD deposits, controlled salary releases, and yield generation
 * @dev HLUSD is the native asset (like ETH) - uses msg.value and payable transfers
 * @dev Separates custody from streaming logic for enhanced security
 * @dev Yield accrues deterministically on reserved payroll capital
 */
contract Treasury {
    
    // ========== STATE VARIABLES ==========

    /// @notice Address of authorized SalaryStream contract
    address public salaryStream;

    /// @notice Owner address for initial setup
    address public owner;

    /// @notice Total native HLUSD deposited per company (employer => companyId => balance)
    mapping(address => mapping(uint256 => uint256)) public companyBalances;

    /// @notice Native HLUSD reserved for active salary streams per company
    mapping(address => mapping(uint256 => uint256)) public companyReserved;

    // ========== YIELD STATE ==========

    /// @notice Annual yield percentage applied to reserved capital (default 5%)
    uint256 public annualYieldPercent = 5;

    /// @notice Seconds in one year for yield calculation
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    /// @notice Timestamp of last yield claim per company
    mapping(address => mapping(uint256 => uint256)) public lastYieldClaim;

    /// @notice Total yield claimed per company (lifetime)
    mapping(address => mapping(uint256 => uint256)) public totalYieldClaimed;

    /// @notice Global total yield paid out
    uint256 public totalYieldPaidGlobal;

    // ========== EVENTS ==========

    event Deposited(address indexed employer, uint256 indexed companyId, uint256 amount);
    event Reserved(address indexed employer, uint256 indexed companyId, uint256 amount);
    event SalaryReleased(address indexed employer, uint256 indexed companyId, address recipient, uint256 amount);
    event SalaryStreamSet(address indexed salaryStream);
    event YieldClaimed(address indexed employer, uint256 indexed companyId, uint256 amount, uint256 reserved, uint256 elapsed);

    // ========== CONSTRUCTOR ==========

    constructor() {
        owner = msg.sender;
    }

    // ========== MODIFIERS ==========

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlySalaryStream() {
        require(msg.sender == salaryStream, "Not authorized");
        _;
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @notice Set the authorized SalaryStream contract (one-time only for security)
     * @param _stream Address of deployed SalaryStream contract
     */
    function setSalaryStream(address _stream) external onlyOwner {
        require(salaryStream == address(0), "Already set");
        require(_stream != address(0), "Invalid address");
        salaryStream = _stream;
        emit SalaryStreamSet(_stream);
    }

    // ========== EMPLOYER FUNCTIONS ==========

    /**
     * @notice Deposit native HLUSD to treasury for a specific company
     * @dev Payable function - send HLUSD with transaction
     * @param companyId ID of the company to deposit for
     */
    function deposit(uint256 companyId) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(companyId > 0, "Invalid company ID");
        
        // Initialize yield tracking on first deposit
        if (lastYieldClaim[msg.sender][companyId] == 0) {
            lastYieldClaim[msg.sender][companyId] = block.timestamp;
        }

        // Update balance (CEI pattern - Effects before Interactions)
        companyBalances[msg.sender][companyId] += msg.value;

        emit Deposited(msg.sender, companyId, msg.value);
    }

    // ========== YIELD FUNCTIONS ==========

    /**
     * @notice Calculate accrued yield for a company
     * @dev yield = reserved * annualYieldPercent * elapsed / (100 * SECONDS_PER_YEAR)
     * @param employer Address of the employer
     * @param companyId ID of the company
     * @return Accrued yield in native HLUSD
     */
    function _calculateYield(address employer, uint256 companyId) internal view returns (uint256) {
        uint256 reserved = companyReserved[employer][companyId];
        if (reserved == 0) return 0;
        
        uint256 lastClaim = lastYieldClaim[employer][companyId];
        if (lastClaim == 0) return 0;
        
        uint256 elapsed = block.timestamp - lastClaim;
        if (elapsed == 0) return 0;

        // Deterministic linear yield: reserved * rate% * time / (100 * year)
        return (reserved * annualYieldPercent * elapsed) / (100 * SECONDS_PER_YEAR);
    }

    /**
     * @notice Claim accrued yield on reserved payroll capital for a company
     * @dev Follows CEI pattern. Yield is minted from treasury surplus.
     * @param companyId ID of the company
     */
    function claimYield(uint256 companyId) external {
        uint256 yieldAmount = _calculateYield(msg.sender, companyId);
        require(yieldAmount > 0, "No yield accrued");
        require(address(this).balance >= yieldAmount, "Insufficient treasury balance");

        uint256 prevClaim = lastYieldClaim[msg.sender][companyId];
        
        // Effects: update state before transfer
        lastYieldClaim[msg.sender][companyId] = block.timestamp;
        totalYieldClaimed[msg.sender][companyId] += yieldAmount;
        totalYieldPaidGlobal += yieldAmount;

        // Interaction: transfer yield to employer
        payable(msg.sender).transfer(yieldAmount);

        emit YieldClaimed(msg.sender, companyId, yieldAmount, companyReserved[msg.sender][companyId], block.timestamp - prevClaim);
    }

    /**
     * @notice Get current accrued (unclaimed) yield for a company
     * @param employer Address of the employer
     * @param companyId ID of the company
     * @return Accrued yield amount
     */
    function getAccruedYield(address employer, uint256 companyId) external view returns (uint256) {
        return _calculateYield(employer, companyId);
    }

    /**
     * @notice Get complete yield statistics for a company
     * @param employer Address of the employer
     * @param companyId ID of the company
     * @return reserved Current reserved capital
     * @return accruedYield Current unclaimed yield
     * @return _totalYieldClaimed Lifetime yield claimed
     * @return _annualYieldPercent Annual yield rate
     * @return _lastClaimTimestamp Last claim timestamp
     */
    function getYieldStats(address employer, uint256 companyId)
        external
        view
        returns (
            uint256 reserved,
            uint256 accruedYield,
            uint256 _totalYieldClaimed,
            uint256 _annualYieldPercent,
            uint256 _lastClaimTimestamp
        )
    {
        return (
            companyReserved[employer][companyId],
            _calculateYield(employer, companyId),
            totalYieldClaimed[employer][companyId],
            annualYieldPercent,
            lastYieldClaim[employer][companyId]
        );
    }

    // ========== SALARY STREAM FUNCTIONS ==========

    /**
     * @notice Reserve native HLUSD for a new salary stream
     * @dev Only callable by authorized SalaryStream contract
     * @param employer Address of the employer
     * @param companyId ID of the company
     * @param amount Total amount to reserve for stream
     */
    function reserveFunds(address employer, uint256 companyId, uint256 amount) external onlySalaryStream {
        // Check available balance (deposited minus already reserved)
        uint256 available = companyBalances[employer][companyId] - companyReserved[employer][companyId];
        require(available >= amount, "Insufficient balance");

        // Initialize yield tracking if not set
        if (lastYieldClaim[employer][companyId] == 0) {
            lastYieldClaim[employer][companyId] = block.timestamp;
        }

        // Reserve the funds
        companyReserved[employer][companyId] += amount;

        emit Reserved(employer, companyId, amount);
    }

    /**
     * @notice Release salary payment to employee or tax vault
     * @dev Only callable by authorized SalaryStream contract
     * @dev Implements Checks-Effects-Interactions pattern for security
     * @param employer Address of the employer
     * @param companyId ID of the company
     * @param to Address receiving the payment (employee or tax vault)
     * @param amount Amount to release in native HLUSD
     */
    function releaseSalary(
        address employer,
        uint256 companyId,
        address to,
        uint256 amount
    ) external onlySalaryStream {
        require(amount > 0, "Amount must be greater than 0");
        require(to != address(0), "Invalid recipient");
        require(companyReserved[employer][companyId] >= amount, "Insufficient reserved");

        // Effects: Update state before external calls
        companyReserved[employer][companyId] -= amount;
        companyBalances[employer][companyId] -= amount;

        // Interaction: Transfer native HLUSD
        payable(to).transfer(amount);

        emit SalaryReleased(employer, companyId, to, amount);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get available (unreserved) balance for a company
     * @param employer Address of the employer
     * @param companyId ID of the company
     * @return Available HLUSD balance
     */
    function getAvailableBalance(address employer, uint256 companyId) external view returns (uint256) {
        return companyBalances[employer][companyId] - companyReserved[employer][companyId];
    }

    /**
     * @notice Get total treasury balance
     * @return Total native HLUSD held by treasury
     */
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ========== EMERGENCY ==========

    /**
     * @notice Fallback - disabled for company-aware deposits
     * @dev Use deposit(companyId) function instead
     */
    receive() external payable {
        revert("Use deposit(companyId) function");
    }
}
