// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./TaxVault.sol";

/**
 * @title PayStream
 * @dev Real-time payroll streaming on HeLa Network
 * Employees earn salary second-by-second with automatic tax withholding
 */
contract PayStream is AccessControl, ReentrancyGuard {
    bytes32 public constant HR_ROLE = keccak256("HR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    IERC20 public hlusd;
    TaxVault public taxVault;
    
    // Tax rate (default 10% = 1000 basis points)
    uint256 public taxRate = 1000; // 10%
    uint256 public constant BASIS_POINTS = 10000; // 100%
    
    struct Stream {
        address employee;
        uint256 salaryPerSecond; // Salary rate in HLUSD per second
        uint256 startTime;
        uint256 lastWithdrawal;
        uint256 totalEarned;
        uint256 totalWithdrawn;
        bool active;
        bool exists;
    }
    
    // Mapping from stream ID to Stream
    mapping(uint256 => Stream) public streams;
    
    // Mapping from employee address to their stream IDs
    mapping(address => uint256[]) public employeeStreams;
    
    // Company treasury balance
    uint256 public treasuryBalance;
    
    // Counter for stream IDs
    uint256 public streamCounter;
    
    // Events
    event StreamCreated(uint256 indexed streamId, address indexed employee, uint256 salaryPerSecond);
    event StreamPaused(uint256 indexed streamId);
    event StreamResumed(uint256 indexed streamId);
    event StreamCancelled(uint256 indexed streamId);
    event Withdrawal(uint256 indexed streamId, address indexed employee, uint256 amount, uint256 taxAmount);
    event TreasuryDeposit(address indexed from, uint256 amount);
    event TaxRateUpdated(uint256 newRate);
    
    constructor(address _hlusd, address _taxVault) {
        require(_hlusd != address(0), "Invalid HLUSD address");
        require(_taxVault != address(0), "Invalid TaxVault address");
        
        hlusd = IERC20(_hlusd);
        taxVault = TaxVault(_taxVault);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(HR_ROLE, msg.sender);
    }
    
    /**
     * @dev Deposit funds into company treasury
     * @param amount Amount to deposit
     */
    function depositToTreasury(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(hlusd.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        treasuryBalance += amount;
        emit TreasuryDeposit(msg.sender, amount);
    }
    
    /**
     * @dev Create a new salary stream
     * @param employee Employee address
     * @param annualSalary Annual salary in HLUSD (will be converted to per-second rate)
     */
    function createStream(address employee, uint256 annualSalary) 
        external 
        onlyRole(HR_ROLE) 
        returns (uint256) 
    {
        require(employee != address(0), "Invalid employee address");
        require(annualSalary > 0, "Salary must be greater than 0");
        
        // Calculate salary per second (365.25 days accounting for leap years)
        uint256 salaryPerSecond = annualSalary / 31557600; // 365.25 * 24 * 60 * 60
        require(salaryPerSecond > 0, "Salary per second too low");
        
        uint256 streamId = streamCounter++;
        
        streams[streamId] = Stream({
            employee: employee,
            salaryPerSecond: salaryPerSecond,
            startTime: block.timestamp,
            lastWithdrawal: block.timestamp,
            totalEarned: 0,
            totalWithdrawn: 0,
            active: true,
            exists: true
        });
        
        employeeStreams[employee].push(streamId);
        
        emit StreamCreated(streamId, employee, salaryPerSecond);
        return streamId;
    }
    
    /**
     * @dev Calculate earned amount for a stream
     * @param streamId Stream ID
     */
    function calculateEarned(uint256 streamId) public view returns (uint256) {
        Stream memory stream = streams[streamId];
        require(stream.exists, "Stream does not exist");
        
        if (!stream.active) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - stream.lastWithdrawal;
        return timeElapsed * stream.salaryPerSecond;
    }
    
    /**
     * @dev Withdraw earned salary
     * @param streamId Stream ID
     */
    function withdraw(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.exists, "Stream does not exist");
        require(stream.employee == msg.sender, "Not authorized");
        require(stream.active, "Stream is not active");
        
        uint256 earned = calculateEarned(streamId);
        require(earned > 0, "No funds to withdraw");
        
        // Calculate tax
        uint256 taxAmount = (earned * taxRate) / BASIS_POINTS;
        uint256 netAmount = earned - taxAmount;
        
        require(treasuryBalance >= earned, "Insufficient treasury balance");
        
        // Update stream state
        stream.lastWithdrawal = block.timestamp;
        stream.totalEarned += earned;
        stream.totalWithdrawn += netAmount;
        treasuryBalance -= earned;
        
        // Transfer net amount to employee
        require(hlusd.transfer(msg.sender, netAmount), "Transfer to employee failed");
        
        // Transfer tax to TaxVault
        require(hlusd.approve(address(taxVault), taxAmount), "Tax approval failed");
        taxVault.depositTax(taxAmount);
        
        emit Withdrawal(streamId, msg.sender, netAmount, taxAmount);
    }
    
    /**
     * @dev Pause a stream
     * @param streamId Stream ID
     */
    function pauseStream(uint256 streamId) external onlyRole(HR_ROLE) {
        Stream storage stream = streams[streamId];
        require(stream.exists, "Stream does not exist");
        require(stream.active, "Stream already paused");
        
        stream.active = false;
        emit StreamPaused(streamId);
    }
    
    /**
     * @dev Resume a paused stream
     * @param streamId Stream ID
     */
    function resumeStream(uint256 streamId) external onlyRole(HR_ROLE) {
        Stream storage stream = streams[streamId];
        require(stream.exists, "Stream does not exist");
        require(!stream.active, "Stream already active");
        
        stream.active = true;
        stream.lastWithdrawal = block.timestamp; // Reset to avoid large payout
        emit StreamResumed(streamId);
    }
    
    /**
     * @dev Cancel a stream permanently
     * @param streamId Stream ID
     */
    function cancelStream(uint256 streamId) external onlyRole(HR_ROLE) {
        Stream storage stream = streams[streamId];
        require(stream.exists, "Stream does not exist");
        
        // Allow employee to withdraw remaining earned amount before cancellation
        uint256 earned = calculateEarned(streamId);
        if (earned > 0 && stream.active) {
            uint256 taxAmount = (earned * taxRate) / BASIS_POINTS;
            uint256 netAmount = earned - taxAmount;
            
            if (treasuryBalance >= earned) {
                stream.totalEarned += earned;
                stream.totalWithdrawn += netAmount;
                treasuryBalance -= earned;
                
                hlusd.transfer(stream.employee, netAmount);
                hlusd.approve(address(taxVault), taxAmount);
                taxVault.depositTax(taxAmount);
            }
        }
        
        stream.active = false;
        emit StreamCancelled(streamId);
    }
    
    /**
     * @dev Update tax rate
     * @param newRate New tax rate in basis points (1000 = 10%)
     */
    function updateTaxRate(uint256 newRate) external onlyRole(ADMIN_ROLE) {
        require(newRate <= BASIS_POINTS, "Invalid tax rate");
        taxRate = newRate;
        emit TaxRateUpdated(newRate);
    }
    
    /**
     * @dev Get employee's active streams
     * @param employee Employee address
     */
    function getEmployeeStreams(address employee) external view returns (uint256[] memory) {
        return employeeStreams[employee];
    }
    
    /**
     * @dev Get stream details
     * @param streamId Stream ID
     */
    function getStreamDetails(uint256 streamId) external view returns (
        address employee,
        uint256 salaryPerSecond,
        uint256 startTime,
        uint256 totalEarned,
        uint256 totalWithdrawn,
        uint256 currentlyEarned,
        bool active
    ) {
        Stream memory stream = streams[streamId];
        require(stream.exists, "Stream does not exist");
        
        return (
            stream.employee,
            stream.salaryPerSecond,
            stream.startTime,
            stream.totalEarned,
            stream.totalWithdrawn,
            calculateEarned(streamId),
            stream.active
        );
    }
}
