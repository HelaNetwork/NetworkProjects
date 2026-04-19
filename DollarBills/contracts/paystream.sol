// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HelaPayStream is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public taxVault; // NEW: The tax savings address
    uint256 public constant TAX_PERCENT = 10; // 10% Tax

    struct Stream {
        uint256 yearlySalary;
        uint256 lastClaimTime;
        bool isActive;
    }

    mapping(address => Stream) public employeeStreams;

    event EmployeeOnboarded(address indexed employee, uint256 yearlySalary);
    event SalaryClaimed(address indexed employee, uint256 amount, uint256 taxPaid);

    // Constructor now takes the Token and the Tax Vault address
    constructor(address _tokenAddress, address _taxVault) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
        taxVault = _taxVault; 
    }

    function onboardEmployee(address _employee, uint256 _yearlySalary) external onlyOwner {
        require(_employee != address(0), "Invalid address");
        employeeStreams[_employee] = Stream({
            yearlySalary: _yearlySalary,
            lastClaimTime: block.timestamp,
            isActive: true
        });
        emit EmployeeOnboarded(_employee, _yearlySalary);
    }

    function claimSalary() external {
        Stream storage stream = employeeStreams[msg.sender];
        require(stream.isActive, "No active stream");

        uint256 timePassed = block.timestamp - stream.lastClaimTime;
        uint256 totalEarned = (stream.yearlySalary * timePassed) / 365 days;
        require(totalEarned > 0, "Nothing to claim");

        // --- TAX LOGIC ---
        uint256 taxAmount = (totalEarned * TAX_PERCENT) / 100;
        uint256 employeeAmount = totalEarned - taxAmount;

        stream.lastClaimTime = block.timestamp;

        token.safeTransfer(taxVault, taxAmount); // Send tax to vault
        token.safeTransfer(msg.sender, employeeAmount); // Send rest to employee

        emit SalaryClaimed(msg.sender, employeeAmount, taxAmount);
    }
}
