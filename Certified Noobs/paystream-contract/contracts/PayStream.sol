// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PayStream is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public immutable hr;
    address public immutable taxVault;
    uint256 public nextStreamId;

    struct Stream {
        address employee;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 withdrawn;
        bool active;
    }

    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public employeeStreamIds;

    event StreamCreated(uint256 indexed id, address indexed employee, uint256 ratePerSecond);
    event StreamPaused(uint256 indexed id);
    event StreamCancelled(uint256 indexed id);
    event Withdrawn(uint256 indexed id, address indexed employee, uint256 netAmount, uint256 taxAmount);
    event TreasuryDeposited(uint256 amount);

    error ZeroAddress();
    error ZeroAmount();
    error Unauthorized();
    error StreamNotFound();
    error StreamInactive();
    error NotEmployee();
    error InsufficientAccrued();
    error InsufficientBalance();

    modifier onlyHR() {
        if (msg.sender != hr) revert Unauthorized();
        _;
    }

    constructor(address _token, address _taxVault) {
        if (_token == address(0) || _taxVault == address(0)) revert ZeroAddress();
        token = IERC20(_token);
        hr = msg.sender;
        taxVault = _taxVault;
    }

    function createStream(address employee, uint256 ratePerSecond) external onlyHR {
        if (employee == address(0)) revert ZeroAddress();
        if (ratePerSecond == 0) revert ZeroAmount();

        uint256 id = nextStreamId++;
        streams[id] = Stream({
            employee: employee,
            ratePerSecond: ratePerSecond,
            startTime: block.timestamp,
            withdrawn: 0,
            active: true
        });
        employeeStreamIds[employee].push(id);
        emit StreamCreated(id, employee, ratePerSecond);
    }

    function pauseStream(uint256 id) external onlyHR {
        Stream storage s = streams[id];
        if (s.employee == address(0)) revert StreamNotFound();
        s.active = false;
        emit StreamPaused(id);
    }

    function cancelStream(uint256 id) external onlyHR {
        Stream storage s = streams[id];
        if (s.employee == address(0)) revert StreamNotFound();
        s.active = false;
        emit StreamCancelled(id);
    }

    function accrued(uint256 id) public view returns (uint256) {
        Stream storage s = streams[id];
        if (!s.active || s.employee == address(0)) return 0;
        uint256 elapsed = block.timestamp - s.startTime;
        uint256 amount = elapsed * s.ratePerSecond;
        if (amount <= s.withdrawn) return 0;
        return amount - s.withdrawn;
    }

    function withdraw(uint256 id) external nonReentrant {
        Stream storage s = streams[id];
        if (s.employee == address(0)) revert StreamNotFound();
        if (!s.active) revert StreamInactive();
        if (msg.sender != s.employee) revert NotEmployee();

        uint256 amount = accrued(id);
        if (amount == 0) revert InsufficientAccrued();

        uint256 tax = (amount * 10) / 100;
        uint256 net = amount - tax;

        if (token.balanceOf(address(this)) < amount) revert InsufficientBalance();

        s.withdrawn += amount;

        token.safeTransfer(taxVault, tax);
        token.safeTransfer(msg.sender, net);
        emit Withdrawn(id, msg.sender, net, tax);
    }

    function treasuryBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function depositToTreasury(uint256 amount) external onlyHR nonReentrant {
        if (amount == 0) revert ZeroAmount();
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit TreasuryDeposited(amount);
    }

    function getStreamIdsForEmployee(address employee) external view returns (uint256[] memory) {
        return employeeStreamIds[employee];
    }
}
