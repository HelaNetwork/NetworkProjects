// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NativePayStream
 * @notice Salary streaming with native HEA. Upgraded for accurate per-second accrual and tax redirection.
 */
contract NativePayStream is ReentrancyGuard {
    address public immutable deployer; // The original deployer
    address public owner;       // Super Admin: Can manage TaxVault and Add/Remove HRs
    mapping(address => bool) public isHR; // HR: Can create streams/bonuses
    
    address public taxVault;
    uint256 public taxBps; // basis points, e.g. 1000 = 10%
    
    uint256 public nextStreamId;
    uint256 public totalReserved; // Tracks funds allocated to BONUS (Fixed) streams only. Endless streams use unreserved treasury.
    uint256 public simulatedYieldRate; // For UI simulation (e.g. 500 = 5%)

    struct Stream {
        address employee;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 lastClaimTime;   // Tracks the time up to which funds have been paid
        uint256 totalDeposited;  // For Fixed streams: Total allocated. For Endless: 0 (or ignored).
        bool active;
        bool isEndless;          // True = Salary (Endless), False = Fixed Duration (Legacy/Not used for standard flow anymore)
        uint256 pausedAt;        // 0 = not paused, else timestamp when paused
        uint256 totalBonusAdded; // One-time bonuses added to this stream
        uint256 bonusWithdrawn;  
    }

    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public employeeStreamIds;

    event StreamCreated(uint256 indexed id, address indexed employee, uint256 ratePerSecond, bool isEndless);
    event StreamPaused(uint256 indexed id);
    event StreamResumed(uint256 indexed id);
    event StreamCancelled(uint256 indexed id);
    event Withdrawn(uint256 indexed id, address indexed employee, uint256 netAmount, uint256 taxAmount);
    event Deposited(address indexed from, uint256 amount);
    event HRAdded(address indexed account);
    event HRRemoved(address indexed account);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event WithdrawnTreasury(address indexed to, uint256 amount);
    event TaxConfigUpdated(address vault, uint256 bps);
    event YieldDeposited(uint256 amount);
    event StreamBonusAdded(uint256 indexed streamId, uint256 amount);

    error ZeroAddress();
    error ZeroAmount();
    error Unauthorized();
    error StreamNotFound();
    error StreamInactive();
    error NotEmployee();
    error InsufficientAccrued();
    error InsufficientContractBalance();
    error ZeroRate();
    error InvalidTaxConfig();

    modifier onlyHR() {
        if (!isHR[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address _taxVault, uint256 _taxBps) {
        deployer = msg.sender;
        owner = msg.sender;
        isHR[msg.sender] = true; // Owner is also HR by default
        taxVault = _taxVault;
        taxBps = _taxBps;
        // Allow 0 address if taxBps is 0
        if (_taxVault == address(0) && _taxBps != 0) revert InvalidTaxConfig();
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function addHR(address account) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        isHR[account] = true;
        emit HRAdded(account);
    }

    function removeHR(address account) external onlyOwner {
        if (account == owner) revert Unauthorized(); // Cannot remove owner from HR list via this (though owner is handled separately in modifier mainly)
        isHR[account] = false;
        emit HRRemoved(account);
    }

    function setTaxConfig(address _taxVault, uint256 _taxBps) external onlyOwner {
        taxVault = _taxVault;
        taxBps = _taxBps;
        emit TaxConfigUpdated(_taxVault, _taxBps);
    }

    function setSimulatedYieldRate(uint256 _rate) external onlyOwner {
        simulatedYieldRate = _rate;
    }

    /// @notice HR/Owner deposits native HEA to contract (treasury).
    function deposit() external payable {
        if (msg.value == 0) revert ZeroAmount();
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Owner deposits yield (native HEA) to contract.
    function addYield() external payable onlyOwner {
        if (msg.value == 0) revert ZeroAmount();
        emit YieldDeposited(msg.value);
    }

    // Creates an ENDLESS stream (Salary)
    function createStream(address employee, uint256 ratePerSecond) external onlyHR nonReentrant {
        _createStream(employee, ratePerSecond);
    }

    function createStreamBatch(address[] calldata employees, uint256[] calldata ratesPerSecond) external onlyHR nonReentrant {
        if (employees.length != ratesPerSecond.length) revert("Length mismatch");
        for (uint256 i = 0; i < employees.length; i++) {
            _createStream(employees[i], ratesPerSecond[i]);
        }
    }

    function _createStream(address employee, uint256 ratePerSecond) internal {
        if (employee == address(0)) revert ZeroAddress();
        if (ratePerSecond == 0) revert ZeroRate();
        
        uint256 id = nextStreamId++;
        
        streams[id] = Stream({
            employee: employee,
            ratePerSecond: ratePerSecond,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            totalDeposited: 0, 
            active: true,
            isEndless: true,
            pausedAt: 0,
            totalBonusAdded: 0,
            bonusWithdrawn: 0
        });
        
        employeeStreamIds[employee].push(id);
        emit StreamCreated(id, employee, ratePerSecond, true);
    }

    // Adds a One-Time Bonus (Fixed Amount) to an existing stream
    function addStreamBonus(uint256 streamId, uint256 amount) external onlyHR nonReentrant {
        Stream storage s = streams[streamId];
        if (s.employee == address(0)) revert StreamNotFound();
        if (amount == 0) revert ZeroAmount();
        
        // Bonus IS reserved because it's a fixed obligation
        if (address(this).balance < totalReserved + amount) revert InsufficientContractBalance();
        
        s.totalBonusAdded += amount;
        totalReserved += amount;
        emit StreamBonusAdded(streamId, amount);
    }

    function pauseStream(uint256 id) external onlyHR {
        Stream storage s = streams[id];
        if (s.employee == address(0)) revert StreamNotFound();
        if (s.pausedAt != 0 || !s.active) return;
        
        s.pausedAt = block.timestamp;
        s.active = false;
        emit StreamPaused(id);
    }

    function resumeStream(uint256 id) external onlyHR {
        Stream storage s = streams[id];
        if (s.employee == address(0)) revert StreamNotFound();
        if (s.pausedAt == 0) return;

        // Shift times forward to account for pause duration
        uint256 pausedDuration = block.timestamp - s.pausedAt;
        s.startTime += pausedDuration;
        s.lastClaimTime += pausedDuration;
        s.pausedAt = 0;
        s.active = true;
        emit StreamResumed(id);
    }

    function cancelStream(uint256 id) external onlyHR nonReentrant {
        Stream storage s = streams[id];
        if (s.employee == address(0)) revert StreamNotFound();
        // Allow cancelling even if already inactive/paused to settle final state? 
        // Logic below handles paying out accrued.

        uint256 accruedAmount = _accrued(s);
        
        s.active = false;
        
        if (accruedAmount > 0) {
            // Try to pay out accrued. If fails (e.g. insufficient funds), we still cancel.
            // But _processWithdrawal reverts on insufficient funds.
            // If we are cancelling, we might want to force it? 
            // For now, standard behavior: must have funds to pay accrued to cancel.
             _processWithdrawal(id, s, accruedAmount);
        }
        
        s.pausedAt = 0;
        s.ratePerSecond = 0; 
        
        // If there were any reserved bonuses that weren't withdrawn, unreserve them?
        // Logic: Bonus is "accrued" immediately upon addition in the `_accrued` logic (see below)?
        // No, current _accrued logic treats bonus as a pot. 
        // If we cancel, any unwithdrawn bonus is returned to treasury (unreserved).
        uint256 bonusRemaining = s.totalBonusAdded > s.bonusWithdrawn ? s.totalBonusAdded - s.bonusWithdrawn : 0;
        if (bonusRemaining > 0) {
            // If we just paid out `accruedAmount`, that included any claimable bonus.
            // `_accrued` includes `bonusRemaining`.
            // So if we successfully called `_processWithdrawal`, bonusRemaining is now 0 (or close to).
            // Actually `_accrued` adds `bonusRemaining`. So `_processWithdrawal` pays it all out.
            // So after `_processWithdrawal`, bonusRemaining effectively becomes 0.
            // We just need to ensure `totalReserved` was updated correctly in `_processWithdrawal`.
        }
        
        emit StreamCancelled(id);
    }
    
    function _accrued(Stream storage s) internal view returns (uint256) {
        if (s.employee == address(0)) return 0;
        
        uint256 currentTime = s.active ? block.timestamp : s.pausedAt;
        
        // Endless streams: No maxDuration cap.
        // Fixed streams (Legacy support?): Use maxDuration.
        // But we only have `isEndless` flag. If `!isEndless` and `totalDeposited > 0`, treat as fixed?
        // We simplified `createStream` to ONLY create Endless. 
        // If there are legacy streams, they might break if we strictly rely on `isEndless` if we redeploy (storage wipe anyway).
        // Since we redeploy, we only care about new logic.
        
        // Base Accrual (Salary)
        uint256 baseAmount = 0;
        if (currentTime > s.lastClaimTime) {
            uint256 elapsed = currentTime - s.lastClaimTime;
            baseAmount = elapsed * s.ratePerSecond;
        }

        // Bonus Accrual (Immediate)
        // Bonus is added to a pot. We treat it as "fully accrued" instantly for simplicity?
        // Or "available".
        uint256 bonusRemaining = s.totalBonusAdded > s.bonusWithdrawn ? s.totalBonusAdded - s.bonusWithdrawn : 0;
        
        return baseAmount + bonusRemaining;
    }

    function accrued(uint256 id) public view returns (uint256) {
        return _accrued(streams[id]);
    }

    function withdraw(uint256 id) external nonReentrant {
        Stream storage s = streams[id];
        if (s.employee == address(0)) revert StreamNotFound();
        if (msg.sender != s.employee) revert NotEmployee();
        
        // If paused, can they withdraw? 
        // Standard: Yes, they can withdraw what was accrued BEFORE pause.
        // But `_accrued` handles `pausedAt`.
        // Constraint: "If treasury can't send money to employee, then the streams pause as failsafe."
        // That implies we check balance.
        
        uint256 amount = _accrued(s);
        if (amount == 0) revert InsufficientAccrued();
        
        // Check Treasury Balance (Failsafe)
        if (address(this).balance < amount) {
            // FAILSAFE: Pause stream if not already paused
            if (s.active) {
                s.pausedAt = block.timestamp;
                s.active = false;
                emit StreamPaused(id);
            }
            revert InsufficientContractBalance(); 
        }

        _processWithdrawal(id, s, amount);
    }
    
    function _processWithdrawal(uint256 id, Stream storage s, uint256 amount) internal {
        // Double check balance (though we checked above)
        if (address(this).balance < amount) revert InsufficientContractBalance();

        uint256 bonusRemaining = s.totalBonusAdded > s.bonusWithdrawn ? s.totalBonusAdded - s.bonusWithdrawn : 0;
        uint256 bonusPart = amount > bonusRemaining ? bonusRemaining : amount;
        
        if (bonusPart > 0) {
            s.bonusWithdrawn += bonusPart;
            // Bonus was Reserved, so we decrement reserved
            if (totalReserved >= bonusPart) {
                totalReserved -= bonusPart;
            } else {
                 // Should not happen if logic is sound
                 totalReserved = 0;
            }
        }
        
        // Base part logic
        uint256 basePart = amount - bonusPart;
        
        if (basePart > 0 && s.ratePerSecond > 0) {
            uint256 timeAdvanced = basePart / s.ratePerSecond;
            s.lastClaimTime += timeAdvanced;
        } else {
             // Sync timestamps if only bonus or weird state
             uint256 currentTime = s.active ? block.timestamp : s.pausedAt;
             if (currentTime > s.lastClaimTime) {
                 s.lastClaimTime = currentTime;
             }
        }
        
        // Tax Logic
        uint256 taxAmount = 0;
        uint256 netAmount = amount;
        
        if (taxBps > 0 && taxVault != address(0)) {
            taxAmount = (amount * taxBps) / 10000;
            netAmount = amount - taxAmount;
            
            if (taxAmount > 0) {
                (bool taxOk,) = payable(taxVault).call{value: taxAmount}("");
                if (!taxOk) { 
                    // If tax fails, give everything to employee? Or revert?
                    // Better to revert or fail safe. Reverting stops withdrawal.
                    // Ignoring tax allows withdrawal.
                    // Let's protect employee: give them full amount if tax fails?
                    // Or prioritize tax?
                    // "If treasury can't send money... pause".
                    // If Tax Vault rejects (e.g. revert), we shouldn't block employee.
                    netAmount = amount; 
                    taxAmount = 0; 
                }
            }
        }

        if (netAmount > 0) {
            (bool ok,) = payable(s.employee).call{value: netAmount}("");
            require(ok, "Transfer failed");
        }
        
        emit Withdrawn(id, s.employee, netAmount, taxAmount);
    }

    function treasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Owner only function to withdraw unreserved funds
    function withdrawTreasury(uint256 amount) external onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();
        
        uint256 available = address(this).balance > totalReserved ? address(this).balance - totalReserved : 0;
        if (available < amount) revert InsufficientContractBalance();
        
        (bool ok,) = payable(owner).call{value: amount}("");
        require(ok, "Transfer failed");
        emit WithdrawnTreasury(owner, amount);
    }
    
    function getStreamIdsForEmployee(address employee) external view returns (uint256[] memory) {
        return employeeStreamIds[employee];
    }
    
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }
}
