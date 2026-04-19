// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PayStream is Ownable, ReentrancyGuard {

    uint256 public treasuryBalance;
    uint256 public taxVaultBalance;

    struct Stream {
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 lastWithdrawTime;
        uint256 taxPercent;
        bool    active;
    }

    mapping(address => Stream) public streams;
    address[] public employees;
    mapping(address => uint256) public pausedAccrued;

    event TreasuryDeposited(address indexed depositor, uint256 amount, uint256 newBalance);
    event StreamCreated(address indexed employee, uint256 ratePerSecond, uint256 taxPercent);
    event Withdrawn(address indexed employee, uint256 net, uint256 tax, uint256 timestamp);
    event StreamPaused(address indexed employee);
    event StreamResumed(address indexed employee);
    event StreamCancelled(address indexed employee, uint256 finalPayout);
    event BonusSent(address indexed employee, uint256 amount);
    event YieldSimulated(uint256 amount, uint256 newTreasury);
    event TaxWithdrawn(address indexed hr, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function deposit() external payable onlyOwner nonReentrant {
        require(msg.value > 0, "PayStream: zero deposit");
        treasuryBalance += msg.value;
        emit TreasuryDeposited(msg.sender, msg.value, treasuryBalance);
    }

    function createStream(
        address employee,
        uint256 ratePerSecond,
        uint256 taxPercent
    ) external onlyOwner {
        require(employee != address(0), "PayStream: zero address");
        require(ratePerSecond > 0, "PayStream: zero rate");
        require(taxPercent <= 100, "PayStream: tax > 100%");
        require(!streams[employee].active, "PayStream: stream already active");

        if (streams[employee].startTime == 0) {
            employees.push(employee);
        }

        streams[employee] = Stream({
            ratePerSecond: ratePerSecond,
            startTime: block.timestamp,
            lastWithdrawTime: block.timestamp,
            taxPercent: taxPercent,
            active: true
        });

        emit StreamCreated(employee, ratePerSecond, taxPercent);
    }

    function getEmployeeCount() external view returns (uint256) {
        return employees.length;
    }

    function getAccrued(address employee) public view returns (uint256 accrued) {
        Stream memory s = streams[employee];
        if (!s.active) return 0;
        uint256 elapsed = block.timestamp - s.lastWithdrawTime;
        accrued = elapsed * s.ratePerSecond;
    }

    function withdrawable(address employee) public view returns (uint256 amount) {
        amount = getAccrued(employee) + pausedAccrued[employee];
    }

    function withdraw() external nonReentrant {
        Stream storage s = streams[msg.sender];
        require(s.startTime > 0, "PayStream: no stream");

        uint256 gross = getAccrued(msg.sender) + pausedAccrued[msg.sender];
        require(gross > 0, "PayStream: nothing accrued");

        uint256 tax = (gross * s.taxPercent) / 100;
        uint256 net = gross - tax;

        require(treasuryBalance >= gross, "PayStream: treasury low");

        pausedAccrued[msg.sender] = 0;
        if (s.active) {
            s.lastWithdrawTime = block.timestamp;
        }
        treasuryBalance -= gross;
        taxVaultBalance += tax;

        (bool success, ) = payable(msg.sender).call{value: net}("");
        require(success, "PayStream: transfer failed");

        emit Withdrawn(msg.sender, net, tax, block.timestamp);
    }

    function pauseStream(address employee) external onlyOwner nonReentrant {
        Stream storage s = streams[employee];
        require(s.active, "PayStream: already paused");

        uint256 accrued = getAccrued(employee);
        if (accrued > 0) {
            pausedAccrued[employee] += accrued;
        }

        s.active = false;
        s.lastWithdrawTime = block.timestamp;

        emit StreamPaused(employee);
    }

    function resumeStream(address employee) external onlyOwner {
        Stream storage s = streams[employee];
        require(s.startTime > 0, "PayStream: stream does not exist");
        require(!s.active, "PayStream: already active");

        s.active = true;
        s.lastWithdrawTime = block.timestamp;

        emit StreamResumed(employee);
    }

    function cancelStream(address employee) external onlyOwner nonReentrant {
        Stream storage s = streams[employee];
        require(s.startTime > 0, "PayStream: stream does not exist");

        uint256 finalPayout = 0;
        uint256 gross = getAccrued(employee) + pausedAccrued[employee];

        if (gross > 0 && treasuryBalance >= gross) {
            uint256 tax = (gross * s.taxPercent) / 100;
            uint256 net = gross - tax;
            treasuryBalance -= gross;
            taxVaultBalance += tax;
            pausedAccrued[employee] = 0;
            (bool success, ) = payable(employee).call{value: net}("");
            require(success, "PayStream: transfer failed");
            finalPayout = net;
            emit Withdrawn(employee, net, tax, block.timestamp);
        }

        streams[employee].active = false;
        delete streams[employee];

        emit StreamCancelled(employee, finalPayout);
    }

    function triggerBonus(address employee, uint256 amount) external onlyOwner nonReentrant {
        require(employee != address(0), "PayStream: zero address");
        require(amount > 0, "PayStream: zero bonus");
        require(treasuryBalance >= amount, "PayStream: treasury low");

        treasuryBalance -= amount;
        (bool success, ) = payable(employee).call{value: amount}("");
        require(success, "PayStream: transfer failed");

        emit BonusSent(employee, amount);
    }

    function simulateYield() external payable onlyOwner nonReentrant {
        require(msg.value > 0, "PayStream: zero yield");
        treasuryBalance += msg.value;
        emit YieldSimulated(msg.value, treasuryBalance);
    }

    function withdrawTax() external onlyOwner nonReentrant {
        uint256 amount = taxVaultBalance;
        require(amount > 0, "PayStream: no tax to withdraw");
        taxVaultBalance = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "PayStream: transfer failed");
        emit TaxWithdrawn(msg.sender, amount);
    }

    receive() external payable {}
}
