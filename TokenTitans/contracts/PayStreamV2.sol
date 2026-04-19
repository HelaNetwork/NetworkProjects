// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IHRS {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title PayStream V2 — Corporate Payroll Streaming Protocol
/// @notice Real-time salary streaming with yield, scheduled bonuses, off-ramp, and compliance
/// @dev Optimized for HeLa testnet — minimal gas, maximum features
/// @author PayStream Protocol

contract PayStreamV2 {

    // ============================================
    // CUSTOM ERRORS
    // ============================================

    error NotHR();
    error NotPlatformOwner();
    error NoActiveStream();
    error ZeroAddress();
    error ZeroAmount();
    error Reentrancy();
    error StreamAlreadyActive();
    error StreamNotPaused();
    error StreamAlreadyPaused();
    error StreamIsPaused();
    error HRCannotBeEmployee();
    error SalaryTooLow();
    error TaxExceedsMax();
    error FeeExceedsMax();
    error InsufficientTreasury();
    error NothingToWithdraw();
    error NoPlatformFees();
    error NoTaxToCollect();
    error TransferFailed();
    error IndexOutOfBounds();
    error SameAddress();
    error BonusNotReady();
    error NoBonusScheduled();
    error OffRampDisabled();
    error InvalidCurrencyCode();
    error NoYieldToCollect();
    error YieldExceedsMax();
    error AlreadyProcessed();

    // ============================================
    // STORAGE
    // ============================================

    IHRS public immutable token;

    address public hr;
    uint8 public platformFeePercent;
    uint8 public defaultTaxPercent;
    uint8 private _locked;

    address public platformOwner;
    uint16 public yieldRateBps;
    bool public offRampEnabled;

    uint256 public treasuryBalance;
    uint256 public taxVault;
    uint256 public platformVault;
    uint256 public totalYieldGenerated;

    uint256 public constant MAX_FEE_PERCENT = 10;
    uint256 public constant MAX_TAX_PERCENT = 50;
    uint256 public constant MAX_YIELD_BPS = 1000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    // ============================================
    // STRUCTS
    // ============================================

    struct Stream {
        uint256 salaryPerSecond;
        uint48 startTime;
        uint48 lastClaimTime;
        uint8 taxPercent;
        bool active;
        bool paused;
        uint256 withdrawn;
    }

    struct ScheduledBonus {
        uint256 amount;
        uint48 releaseTime;
        bool claimed;
        bool exists;
    }

    struct OffRampRequest {
        uint256 amount;
        uint48 timestamp;
        uint8 currencyCode;
        bool processed;
        bool exists;
    }

    // ============================================
    // MAPPINGS
    // ============================================

    mapping(address => Stream) public streams;
    mapping(address => ScheduledBonus[]) private _scheduledBonuses;
    mapping(address => OffRampRequest[]) private _offRampRequests;
    mapping(address => uint256) public employeeYieldEarned;
    mapping(uint8 => uint256) public exchangeRates;

    address[] public employeeList;
    mapping(address => bool) private _isEmployee;

    // ============================================
    // EVENTS
    // ============================================

    event TreasuryDeposited(address indexed by, uint256 amount);
    event TreasuryWithdrawn(address indexed by, uint256 amount);
    event StreamStarted(address indexed employee, uint256 salaryPerSecond);
    event StreamPaused(address indexed employee);
    event StreamResumed(address indexed employee);
    event SalaryUpdated(address indexed employee, uint256 oldRate, uint256 newRate);
    event TaxUpdated(address indexed employee, uint256 oldTax, uint256 newTax);
    event EmployeeTerminated(address indexed employee, uint256 finalPayout);
    event SalaryWithdrawn(address indexed employee, uint256 gross, uint256 net, uint256 tax, uint256 fee);
    event BonusIssued(address indexed employee, uint256 amount);
    event PlatformFeesCollected(address indexed collector, uint256 amount);
    event TaxCollected(address indexed collector, uint256 amount);
    event HRTransferred(address indexed oldHR, address indexed newHR);
    event PlatformOwnerTransferred(address indexed oldOwner, address indexed newOwner);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event DefaultTaxUpdated(uint256 oldTax, uint256 newTax);
    event BonusScheduled(address indexed employee, uint256 amount, uint48 releaseTime);
    event BonusClaimed(address indexed employee, uint256 amount, uint256 bonusIndex);
    event BonusCancelled(address indexed employee, uint256 amount, uint256 bonusIndex);
    event YieldRateUpdated(uint256 oldRate, uint256 newRate);
    event YieldDistributed(address indexed employee, uint256 amount);
    event YieldCollected(address indexed employee, uint256 amount);
    event OffRampRequested(address indexed employee, uint256 tokenAmount, uint8 currencyCode, uint256 localAmount, uint256 requestIndex);
    event OffRampProcessed(address indexed employee, uint256 requestIndex);
    event OffRampToggled(bool enabled);
    event ExchangeRateUpdated(uint8 currencyCode, uint256 rate);

    // ============================================
    // MODIFIERS
    // ============================================

    modifier onlyHR() {
        if (msg.sender != hr) revert NotHR();
        _;
    }

    modifier onlyPlatformOwner() {
        if (msg.sender != platformOwner) revert NotPlatformOwner();
        _;
    }

    modifier streamExists(address employee) {
        if (!streams[employee].active) revert NoActiveStream();
        _;
    }

    modifier noReentrant() {
        if (_locked == 1) revert Reentrancy();
        _locked = 1;
        _;
        _locked = 0;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor(address tokenAddress) {
        if (tokenAddress == address(0)) revert ZeroAddress();
        token = IHRS(tokenAddress);
        hr = msg.sender;
        platformOwner = msg.sender;
        platformFeePercent = 2;
        defaultTaxPercent = 5;
        yieldRateBps = 500;
        offRampEnabled = true;

        exchangeRates[1] = 83_500_000;
        exchangeRates[2] = 1_000_000;
        exchangeRates[3] = 920_000;
        exchangeRates[4] = 790_000;
    }

    // ============================================
    // TREASURY
    // ============================================

    function deposit(uint256 amount) external onlyHR noReentrant {
        if (amount == 0) revert ZeroAmount();
        bool success = token.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        unchecked {
            treasuryBalance += amount;
        }
        emit TreasuryDeposited(msg.sender, amount);
    }

    function withdrawUnused(uint256 amount) external onlyHR noReentrant {
        if (amount == 0) revert ZeroAmount();
        uint256 _treasury = treasuryBalance;
        if (_treasury < amount) revert InsufficientTreasury();
        unchecked {
            treasuryBalance = _treasury - amount;
        }
        bool success = token.transfer(hr, amount);
        if (!success) revert TransferFailed();
        emit TreasuryWithdrawn(msg.sender, amount);
    }

    // ============================================
    // STREAM MANAGEMENT
    // ============================================

    function startStream(address employee, uint256 salaryPerSecond) external onlyHR {
        if (employee == address(0)) revert ZeroAddress();
        if (streams[employee].active) revert StreamAlreadyActive();
        if (salaryPerSecond == 0) revert SalaryTooLow();
        if (employee == hr) revert HRCannotBeEmployee();

        uint48 currentTime = uint48(block.timestamp);

        streams[employee] = Stream({
            salaryPerSecond: salaryPerSecond,
            startTime: currentTime,
            lastClaimTime: currentTime,
            withdrawn: 0,
            taxPercent: defaultTaxPercent,
            active: true,
            paused: false
        });

        if (!_isEmployee[employee]) {
            employeeList.push(employee);
            _isEmployee[employee] = true;
        }

        emit StreamStarted(employee, salaryPerSecond);
    }

    function pauseStream(address employee) external onlyHR streamExists(employee) {
        Stream storage s = streams[employee];
        if (s.paused) revert StreamAlreadyPaused();
        s.paused = true;
        emit StreamPaused(employee);
    }

    function resumeStream(address employee) external onlyHR streamExists(employee) {
        Stream storage s = streams[employee];
        if (!s.paused) revert StreamNotPaused();
        s.paused = false;
        s.lastClaimTime = uint48(block.timestamp);
        emit StreamResumed(employee);
    }

    function updateSalary(address employee, uint256 newRate) external onlyHR streamExists(employee) {
        if (newRate == 0) revert SalaryTooLow();
        uint256 oldRate = streams[employee].salaryPerSecond;
        streams[employee].salaryPerSecond = newRate;
        emit SalaryUpdated(employee, oldRate, newRate);
    }

    function updateTax(address employee, uint256 newTaxPercent) external onlyHR streamExists(employee) {
        if (newTaxPercent > MAX_TAX_PERCENT) revert TaxExceedsMax();
        uint256 oldTax = streams[employee].taxPercent;
        streams[employee].taxPercent = uint8(newTaxPercent);
        emit TaxUpdated(employee, oldTax, newTaxPercent);
    }

    function terminateEmployee(address employee) external onlyHR streamExists(employee) noReentrant {
        uint256 pendingGross = earned(employee);
        uint256 finalPayout;

        if (pendingGross != 0) {
            uint256 _treasury = treasuryBalance;
            if (_treasury >= pendingGross) {
                Stream storage s = streams[employee];

                uint256 pFee;
                uint256 tAmt;
                uint256 net;

                unchecked {
                    pFee = (pendingGross * platformFeePercent) / 100;
                    tAmt = (pendingGross * s.taxPercent) / 100;
                    net = pendingGross - pFee - tAmt;
                    treasuryBalance = _treasury - pendingGross;
                    s.withdrawn += pendingGross;
                    platformVault += pFee;
                    taxVault += tAmt;
                }

                s.lastClaimTime = uint48(block.timestamp);

                bool success = token.transfer(employee, net);
                if (!success) revert TransferFailed();
                finalPayout = net;

                emit SalaryWithdrawn(employee, pendingGross, net, tAmt, pFee);
            }
        }

        streams[employee].active = false;
        streams[employee].paused = false;
        emit EmployeeTerminated(employee, finalPayout);
    }

    // ============================================
    // INSTANT BONUS
    // ============================================

    function giveBonus(address employee, uint256 amount) external onlyHR noReentrant {
        if (employee == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        uint256 _treasury = treasuryBalance;
        if (_treasury < amount) revert InsufficientTreasury();
        unchecked {
            treasuryBalance = _treasury - amount;
        }
        bool success = token.transfer(employee, amount);
        if (!success) revert TransferFailed();
        emit BonusIssued(employee, amount);
    }

    // ============================================
    // SCHEDULED BONUSES
    // ============================================

    function scheduleBonus(
        address employee,
        uint256 amount,
        uint48 releaseTime
    ) external onlyHR {
        if (employee == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (releaseTime <= uint48(block.timestamp)) revert BonusNotReady();

        uint256 _treasury = treasuryBalance;
        if (_treasury < amount) revert InsufficientTreasury();

        unchecked {
            treasuryBalance = _treasury - amount;
        }

        _scheduledBonuses[employee].push(ScheduledBonus({
            amount: amount,
            releaseTime: releaseTime,
            claimed: false,
            exists: true
        }));

        emit BonusScheduled(employee, amount, releaseTime);
    }

    function claimScheduledBonus(uint256 bonusIndex) external noReentrant {
        uint256 len = _scheduledBonuses[msg.sender].length;
        if (bonusIndex >= len) revert IndexOutOfBounds();

        ScheduledBonus storage b = _scheduledBonuses[msg.sender][bonusIndex];
        if (!b.exists) revert NoBonusScheduled();
        if (b.claimed) revert NoBonusScheduled();
        if (uint48(block.timestamp) < b.releaseTime) revert BonusNotReady();

        b.claimed = true;
        uint256 amount = b.amount;

        bool success = token.transfer(msg.sender, amount);
        if (!success) revert TransferFailed();

        emit BonusClaimed(msg.sender, amount, bonusIndex);
    }

    function cancelScheduledBonus(
        address employee,
        uint256 bonusIndex
    ) external onlyHR {
        uint256 len = _scheduledBonuses[employee].length;
        if (bonusIndex >= len) revert IndexOutOfBounds();

        ScheduledBonus storage b = _scheduledBonuses[employee][bonusIndex];
        if (!b.exists || b.claimed) revert NoBonusScheduled();

        b.exists = false;
        uint256 amount = b.amount;

        unchecked {
            treasuryBalance += amount;
        }

        emit BonusCancelled(employee, amount, bonusIndex);
    }

    // ============================================
    // YIELD INTEGRATION
    // ============================================

    function calculateYield(address employee) public view returns (uint256 yieldAmount) {
        Stream memory s = streams[employee];
        if (!s.active || s.paused) return 0;

        uint256 elapsed = block.timestamp - s.lastClaimTime;
        uint256 stakedAmount = elapsed * s.salaryPerSecond;

        if (stakedAmount == 0) return 0;

        unchecked {
            yieldAmount = (stakedAmount * yieldRateBps * elapsed) / (SECONDS_PER_YEAR * 10000);
        }
    }

    function distributeYield(address employee) external onlyHR streamExists(employee) {
        uint256 yieldAmount = calculateYield(employee);
        if (yieldAmount == 0) revert NoYieldToCollect();

        uint256 _treasury = treasuryBalance;
        if (_treasury < yieldAmount) revert InsufficientTreasury();

        unchecked {
            treasuryBalance = _treasury - yieldAmount;
            employeeYieldEarned[employee] += yieldAmount;
            totalYieldGenerated += yieldAmount;
        }

        emit YieldDistributed(employee, yieldAmount);
    }

    function claimYield() external noReentrant {
        uint256 amount = employeeYieldEarned[msg.sender];
        if (amount == 0) revert NoYieldToCollect();

        employeeYieldEarned[msg.sender] = 0;

        bool success = token.transfer(msg.sender, amount);
        if (!success) revert TransferFailed();

        emit YieldCollected(msg.sender, amount);
    }

    function updateYieldRate(uint16 newRateBps) external onlyPlatformOwner {
        if (newRateBps > MAX_YIELD_BPS) revert YieldExceedsMax();
        uint256 oldRate = yieldRateBps;
        yieldRateBps = newRateBps;
        emit YieldRateUpdated(oldRate, newRateBps);
    }

    // ============================================
    // OFF-RAMP
    // ============================================

    function requestOffRamp(
        uint256 amount,
        uint8 currencyCode
    ) external noReentrant {
        if (!offRampEnabled) revert OffRampDisabled();
        if (amount == 0) revert ZeroAmount();
        if (currencyCode == 0 || currencyCode > 4) revert InvalidCurrencyCode();

        bool success = token.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();

        uint256 localAmount;
        unchecked {
            localAmount = (amount * exchangeRates[currencyCode]) / 1e24;
        }

        uint256 requestIndex = _offRampRequests[msg.sender].length;

        _offRampRequests[msg.sender].push(OffRampRequest({
            amount: amount,
            timestamp: uint48(block.timestamp),
            currencyCode: currencyCode,
            processed: false,
            exists: true
        }));

        emit OffRampRequested(msg.sender, amount, currencyCode, localAmount, requestIndex);
    }

    function processOffRamp(
        address employee,
        uint256 requestIndex
    ) external onlyHR {
        uint256 len = _offRampRequests[employee].length;
        if (requestIndex >= len) revert IndexOutOfBounds();

        OffRampRequest storage req = _offRampRequests[employee][requestIndex];
        if (!req.exists) revert NoBonusScheduled();
        if (req.processed) revert AlreadyProcessed();

        req.processed = true;

        emit OffRampProcessed(employee, requestIndex);
    }

    function toggleOffRamp() external onlyHR {
        offRampEnabled = !offRampEnabled;
        emit OffRampToggled(offRampEnabled);
    }

    function updateExchangeRate(uint8 currencyCode, uint256 rate) external onlyHR {
        if (currencyCode == 0 || currencyCode > 4) revert InvalidCurrencyCode();
        if (rate == 0) revert ZeroAmount();
        exchangeRates[currencyCode] = rate;
        emit ExchangeRateUpdated(currencyCode, rate);
    }

    // ============================================
    // EARN CALCULATION
    // ============================================

    function earned(address employee) public view returns (uint256) {
        Stream memory s = streams[employee];
        if (!s.active || s.paused) return 0;
        unchecked {
            return (block.timestamp - s.lastClaimTime) * s.salaryPerSecond;
        }
    }

    function earnedBreakdown(address employee)
        external
        view
        returns (
            uint256 netSalary,
            uint256 taxAmount,
            uint256 platformFee,
            uint256 yieldEarned
        )
    {
        uint256 gross = earned(employee);
        if (gross == 0) return (0, 0, 0, 0);
        Stream memory s = streams[employee];
        unchecked {
            platformFee = (gross * platformFeePercent) / 100;
            taxAmount = (gross * s.taxPercent) / 100;
            netSalary = gross - platformFee - taxAmount;
        }
        yieldEarned = calculateYield(employee) + employeeYieldEarned[employee];
    }

    // ============================================
    // WITHDRAW
    // ============================================

    function withdrawSalary() external streamExists(msg.sender) noReentrant {
        Stream storage s = streams[msg.sender];
        if (s.paused) revert StreamIsPaused();

        uint256 gross = earned(msg.sender);
        if (gross == 0) revert NothingToWithdraw();

        uint256 _treasury = treasuryBalance;
        if (_treasury < gross) revert InsufficientTreasury();

        uint256 pFee;
        uint256 tAmt;
        uint256 net;

        unchecked {
            pFee = (gross * platformFeePercent) / 100;
            tAmt = (gross * s.taxPercent) / 100;
            net = gross - pFee - tAmt;
            treasuryBalance = _treasury - gross;
            s.withdrawn += gross;
            platformVault += pFee;
            taxVault += tAmt;
        }

        s.lastClaimTime = uint48(block.timestamp);

        bool success = token.transfer(msg.sender, net);
        if (!success) revert TransferFailed();

        emit SalaryWithdrawn(msg.sender, gross, net, tAmt, pFee);
    }

    // ============================================
    // PLATFORM COLLECTION
    // ============================================

    function collectPlatformFees() external onlyPlatformOwner noReentrant {
        uint256 amount = platformVault;
        if (amount == 0) revert NoPlatformFees();
        platformVault = 0;
        bool success = token.transfer(platformOwner, amount);
        if (!success) revert TransferFailed();
        emit PlatformFeesCollected(platformOwner, amount);
    }

    function collectTax() external onlyHR noReentrant {
        uint256 amount = taxVault;
        if (amount == 0) revert NoTaxToCollect();
        taxVault = 0;
        bool success = token.transfer(hr, amount);
        if (!success) revert TransferFailed();
        emit TaxCollected(hr, amount);
    }

    // ============================================
    // ADMIN
    // ============================================

    function transferHR(address newHR) external onlyHR {
        if (newHR == address(0)) revert ZeroAddress();
        if (newHR == hr) revert SameAddress();
        address oldHR = hr;
        hr = newHR;
        emit HRTransferred(oldHR, newHR);
    }

    function transferPlatformOwner(address newOwner) external onlyPlatformOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        if (newOwner == platformOwner) revert SameAddress();
        address oldOwner = platformOwner;
        platformOwner = newOwner;
        emit PlatformOwnerTransferred(oldOwner, newOwner);
    }

    function updatePlatformFee(uint256 newFeePercent) external onlyPlatformOwner {
        if (newFeePercent > MAX_FEE_PERCENT) revert FeeExceedsMax();
        uint256 oldFee = platformFeePercent;
        platformFeePercent = uint8(newFeePercent);
        emit PlatformFeeUpdated(oldFee, newFeePercent);
    }

    function updateDefaultTax(uint256 newTaxPercent) external onlyHR {
        if (newTaxPercent > MAX_TAX_PERCENT) revert TaxExceedsMax();
        uint256 oldTax = defaultTaxPercent;
        defaultTaxPercent = uint8(newTaxPercent);
        emit DefaultTaxUpdated(oldTax, newTaxPercent);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    function contractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function streamDetails(address employee) external view returns (Stream memory) {
        return streams[employee];
    }

    function totalEmployees() external view returns (uint256) {
        return employeeList.length;
    }

    function getEmployee(uint256 index) external view returns (address) {
        if (index >= employeeList.length) revert IndexOutOfBounds();
        return employeeList[index];
    }

    function totalLiability() external view returns (uint256) {
        uint256 total;
        uint256 len = employeeList.length;
        for (uint256 i; i < len;) {
            address emp = employeeList[i];
            Stream memory s = streams[emp];
            if (s.active && !s.paused) {
                unchecked {
                    total += (block.timestamp - s.lastClaimTime) * s.salaryPerSecond;
                }
            }
            unchecked { ++i; }
        }
        return total;
    }

    function getScheduledBonusCount(address employee) external view returns (uint256) {
        return _scheduledBonuses[employee].length;
    }

    function getScheduledBonus(
        address employee,
        uint256 index
    ) external view returns (uint256 amount, uint48 releaseTime, bool claimed, bool exists) {
        uint256 len = _scheduledBonuses[employee].length;
        if (index >= len) revert IndexOutOfBounds();
        ScheduledBonus storage b = _scheduledBonuses[employee][index];
        amount = b.amount;
        releaseTime = b.releaseTime;
        claimed = b.claimed;
        exists = b.exists;
    }

    function getPendingBonuses(address employee)
        external
        view
        returns (uint256 totalPending, uint256 totalClaimable)
    {
        uint256 len = _scheduledBonuses[employee].length;
        uint48 now_ = uint48(block.timestamp);

        for (uint256 i; i < len;) {
            ScheduledBonus storage b = _scheduledBonuses[employee][i];
            if (b.exists && !b.claimed) {
                totalPending += b.amount;
                if (now_ >= b.releaseTime) {
                    totalClaimable += b.amount;
                }
            }
            unchecked { ++i; }
        }
    }

    function getOffRampCount(address employee) external view returns (uint256) {
        return _offRampRequests[employee].length;
    }

    function getOffRampRequest(
        address employee,
        uint256 index
    ) external view returns (uint256 amount, uint48 timestamp, uint8 currencyCode, bool processed, bool exists) {
        uint256 len = _offRampRequests[employee].length;
        if (index >= len) revert IndexOutOfBounds();
        OffRampRequest storage req = _offRampRequests[employee][index];
        amount = req.amount;
        timestamp = req.timestamp;
        currencyCode = req.currencyCode;
        processed = req.processed;
        exists = req.exists;
    }

    function previewOffRamp(
        uint256 amount,
        uint8 currencyCode
    ) external view returns (uint256 localAmount) {
        if (currencyCode == 0 || currencyCode > 4) revert InvalidCurrencyCode();
        unchecked {
            localAmount = (amount * exchangeRates[currencyCode]) / 1e24;
        }
    }

    function getCurrencyName(uint8 code) external pure returns (string memory) {
        if (code == 1) return "INR";
        if (code == 2) return "USD";
        if (code == 3) return "EUR";
        if (code == 4) return "GBP";
        return "UNKNOWN";
    }

    // ============================================
    // DASHBOARD — Split into separate functions to avoid stack too deep
    // ============================================

    /// @notice Get employee salary info
    function getEmployeeSalaryInfo(address employee)
        external
        view
        returns (
            uint256 grossEarned,
            uint256 netEarned,
            uint256 taxAmount,
            uint256 platformFee,
            uint256 totalWithdrawn,
            uint256 salaryPerSecond,
            bool isActive,
            bool isPaused
        )
    {
        Stream memory s = streams[employee];
        isActive = s.active;
        isPaused = s.paused;
        salaryPerSecond = s.salaryPerSecond;
        totalWithdrawn = s.withdrawn;

        grossEarned = earned(employee);
        if (grossEarned != 0) {
            unchecked {
                platformFee = (grossEarned * platformFeePercent) / 100;
                taxAmount = (grossEarned * s.taxPercent) / 100;
                netEarned = grossEarned - platformFee - taxAmount;
            }
        }
    }

    /// @notice Get employee yield info
    function getEmployeeYieldInfo(address employee)
        external
        view
        returns (
            uint256 yieldPending,
            uint256 yieldClaimable
        )
    {
        yieldPending = calculateYield(employee);
        yieldClaimable = employeeYieldEarned[employee];
    }

    /// @notice Get employee bonus info
    function getEmployeeBonusInfo(address employee)
        external
        view
        returns (
            uint256 pendingBonuses,
            uint256 claimableBonuses
        )
    {
        uint256 len = _scheduledBonuses[employee].length;
        uint48 now_ = uint48(block.timestamp);

        for (uint256 i; i < len;) {
            ScheduledBonus storage b = _scheduledBonuses[employee][i];
            if (b.exists && !b.claimed) {
                pendingBonuses += b.amount;
                if (now_ >= b.releaseTime) {
                    claimableBonuses += b.amount;
                }
            }
            unchecked { ++i; }
        }
    }

    /// @notice Get HR dashboard — treasury and platform stats
    function getHRDashboard()
        external
        view
        returns (
            uint256 treasury,
            uint256 totalTax,
            uint256 totalPlatformFees,
            uint256 totalYield,
            uint256 liability,
            uint256 employeeCount,
            uint256 activeCount,
            uint256 contractBal
        )
    {
        treasury = treasuryBalance;
        totalTax = taxVault;
        totalPlatformFees = platformVault;
        totalYield = totalYieldGenerated;
        contractBal = token.balanceOf(address(this));
        employeeCount = employeeList.length;

        for (uint256 i; i < employeeCount;) {
            address emp = employeeList[i];
            Stream memory s = streams[emp];
            if (s.active) {
                unchecked { ++activeCount; }
                if (!s.paused) {
                    unchecked {
                        liability += (block.timestamp - s.lastClaimTime) * s.salaryPerSecond;
                    }
                }
            }
            unchecked { ++i; }
        }
    }
}