// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PayrollTreasury
 * @notice Holds HLUSD deposits for payroll funding. HR deposits funds here
 *         before creating streams. PayStream pulls funds on stream creation.
 */
contract PayrollTreasury is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable hlusd;
    address public payStream;

    event Deposited(address indexed from, uint256 amount);
    event FundsPulled(address indexed to, uint256 amount);
    event PayStreamSet(address indexed payStream);
    event Withdrawn(address indexed to, uint256 amount);

    modifier onlyPayStream() {
        require(msg.sender == payStream, "Treasury: not PayStream");
        _;
    }

    constructor(address _hlusd) Ownable(msg.sender) {
        require(_hlusd != address(0), "Treasury: zero token");
        hlusd = IERC20(_hlusd);
    }

    /// @notice Set the PayStream contract address (one-time or updatable by owner)
    function setPayStream(address _payStream) external onlyOwner {
        require(_payStream != address(0), "Treasury: zero address");
        payStream = _payStream;
        emit PayStreamSet(_payStream);
    }

    /// @notice HR deposits HLUSD into the treasury
    function deposit(uint256 amount) external {
        require(amount > 0, "Treasury: zero amount");
        hlusd.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    /// @notice Returns current HLUSD balance
    function getBalance() external view returns (uint256) {
        return hlusd.balanceOf(address(this));
    }

    /// @notice Compute required funding for a batch of streams
    function getRequiredFunding(uint256[] calldata totalAmounts) external pure returns (uint256 total) {
        for (uint256 i = 0; i < totalAmounts.length; i++) {
            total += totalAmounts[i];
        }
    }

    /// @notice Called by PayStream to pull funds for stream creation
    function pullFunds(address to, uint256 amount) external onlyPayStream {
        require(amount > 0, "Treasury: zero amount");
        hlusd.safeTransfer(to, amount);
        emit FundsPulled(to, amount);
    }

    /// @notice Owner can withdraw surplus funds
    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Treasury: zero address");
        hlusd.safeTransfer(to, amount);
        emit Withdrawn(to, amount);
    }
}
