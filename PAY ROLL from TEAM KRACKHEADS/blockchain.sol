// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CorePayroll {
    
    // -- 1. CONFIGURATION --
    address public employer; 
    address public taxVault; 
    uint256 public constant TAX_RATE = 10; 

    struct Stream {
        uint256 ratePerSecond;
        uint256 lastWithdrawTime;
        uint256 accruedBalance; // The Safety Net
        bool isActive;
    }

    mapping(address => Stream) public streams;

    event StreamStarted(address indexed employee, uint256 rate);
    event StreamStopped(address indexed employee);
    event Withdrawal(address indexed employee, uint256 netAmount, uint256 taxAmount);
    event TreasuryFunded(uint256 amount);
    event EmergencyWithdrawal(uint256 amountRecovered); // <-- NEW EVENT

    modifier onlyEmployer() {
        require(msg.sender == employer, "Only HR/Employer can do this");
        _;
    }

    constructor(address _taxVault) {
        employer = msg.sender;
        taxVault = _taxVault;
    }

    receive() external payable {
        emit TreasuryFunded(msg.value);
    }

    // -- HR DASHBOARD FUNCTIONS --
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function startStream(address _employee, uint256 _ratePerSecond) external onlyEmployer {
        Stream storage s = streams[_employee];
        
        // SAFETY NET: Save pending earnings before updating
        if (s.isActive) {
            uint256 timeElapsed = block.timestamp - s.lastWithdrawTime;
            s.accruedBalance += timeElapsed * s.ratePerSecond;
        }

        s.ratePerSecond = _ratePerSecond;
        s.lastWithdrawTime = block.timestamp;
        s.isActive = true;
        
        emit StreamStarted(_employee, _ratePerSecond);
    }

    function stopStream(address _employee) external onlyEmployer {
        Stream storage s = streams[_employee];
        require(s.isActive, "Stream is already inactive");
        
        // SAFETY NET: Save final earnings before pausing
        uint256 timeElapsed = block.timestamp - s.lastWithdrawTime;
        s.accruedBalance += timeElapsed * s.ratePerSecond;
        
        s.isActive = false;
        emit StreamStopped(_employee);
    }

    // -- EMPLOYEE PORTAL FUNCTIONS --
    function claimableAmount(address _employee) public view returns (uint256) {
        Stream memory s = streams[_employee];
        uint256 total = s.accruedBalance;
        
        if (s.isActive) {
            uint256 timeElapsed = block.timestamp - s.lastWithdrawTime;
            total += timeElapsed * s.ratePerSecond;
        }
        return total;
    }

    function withdraw() external {
        uint256 totalAccrued = claimableAmount(msg.sender);
        require(totalAccrued > 0, "No funds earned yet");
        require(address(this).balance >= totalAccrued, "Treasury empty - Contact HR");

        Stream storage s = streams[msg.sender];
        s.lastWithdrawTime = block.timestamp;
        s.accruedBalance = 0;

        uint256 taxDeduction = (totalAccrued * TAX_RATE) / 100;
        uint256 netSalary = totalAccrued - taxDeduction;

        (bool taxSuccess, ) = payable(taxVault).call{value: taxDeduction}("");
        require(taxSuccess, "Tax transfer failed");

        (bool empSuccess, ) = payable(msg.sender).call{value: netSalary}("");
        require(empSuccess, "Employee transfer failed");

        emit Withdrawal(msg.sender, netSalary, taxDeduction);
    }

    // -- NEW: EMERGENCY ESCAPE HATCH --
    function emergencyWithdraw() external onlyEmployer {
        uint256 balance = address(this).balance;
        require(balance > 0, "Treasury is already empty");

        // Sends 100% of the remaining treasury straight back to the Boss
        (bool success, ) = payable(employer).call{value: balance}("");
        require(success, "Emergency withdrawal failed");

        emit EmergencyWithdrawal(balance);
    }
}