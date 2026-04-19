// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract SalaryStreaming {

    /*//////////////////////////////////////////////////////////////
                        REENTRANCY GUARD
    //////////////////////////////////////////////////////////////*/
    uint256 private _locked;

    modifier nonReentrant() {
        require(_locked == 0, "Reentrancy detected");
        _locked = 1;
        _;
        _locked = 0;
    }

    /*//////////////////////////////////////////////////////////////
                               CONSTANTS
    //////////////////////////////////////////////////////////////*/
    uint256 public constant SECONDS_PER_MONTH = 30 days;
    uint256 public constant SCALE = 1e18;

    enum Status {
        Inactive,
        Active,
        Paused,
        Cancelled
    }

    Status public status;

    address public immutable employer;
    address public immutable employee;
    address public immutable taxVault;

    uint256 public monthlySalary;
    uint256 public ratePerSecondScaled;
    uint256 public taxPercent;

    uint256 public lastUpdateTime;
    uint256 public accruedBalance;
    uint256 public alreadyWithdrawn;

    modifier onlyEmployer() {
        require(msg.sender == employer, "Not employer");
        _;
    }

    modifier onlyEmployee() {
        require(msg.sender == employee, "Not employee");
        _;
    }

    constructor(
        address _employer,
        address _employee,
        address _taxVault,
        uint256 _monthlySalary,
        uint256 _taxPercent
    ) payable {
        require(_employer != address(0), "Invalid employer");
        require(_employee != address(0), "Invalid employee");
        require(_taxVault != address(0), "Invalid tax vault");
        require(_taxPercent <= 100, "Invalid tax percent");

        employer = _employer;
        employee = _employee;
        taxVault = _taxVault;

        monthlySalary = _monthlySalary;
        taxPercent = _taxPercent;

        ratePerSecondScaled =
            (_monthlySalary * SCALE) / SECONDS_PER_MONTH;

        status = Status.Active;
        lastUpdateTime = block.timestamp;
    }

    function _currentEarnings() internal view returns (uint256) {
        if (status == Status.Active) {
            uint256 elapsed = block.timestamp - lastUpdateTime;
            uint256 earned =
                (elapsed * ratePerSecondScaled) / SCALE;
            return accruedBalance + earned;
        }
        return accruedBalance;
    }

    function withdrawableAmount() public view returns (uint256) {
        uint256 earned = _currentEarnings();
        if (earned <= alreadyWithdrawn) return 0;
        return earned - alreadyWithdrawn;
    }

    function withdraw() external onlyEmployee nonReentrant {
        uint256 amount = withdrawableAmount();
        require(amount > 0, "Nothing to withdraw");

        uint256 taxAmount = (amount * taxPercent) / 100;
        uint256 netPay = amount - taxAmount;

        alreadyWithdrawn += amount;

        (bool ok1, ) = employee.call{value: netPay}("");
        require(ok1, "Employee transfer failed");

        (bool ok2, ) = taxVault.call{value: taxAmount}("");
        require(ok2, "Tax transfer failed");
    }

    function pause() external onlyEmployer {
        require(status == Status.Active, "Not active");

        accruedBalance +=
            ((block.timestamp - lastUpdateTime)
                * ratePerSecondScaled) / SCALE;

        lastUpdateTime = block.timestamp;
        status = Status.Paused;
    }

    function resume() external onlyEmployer {
        require(status == Status.Paused, "Not paused");
        lastUpdateTime = block.timestamp;
        status = Status.Active;
    }

    function cancel() external onlyEmployer {
        require(status != Status.Cancelled, "Already cancelled");

        if (status == Status.Active) {
            accruedBalance +=
                ((block.timestamp - lastUpdateTime)
                    * ratePerSecondScaled) / SCALE;
        }

        ratePerSecondScaled = 0;
        status = Status.Cancelled;
    }

    receive() external payable {}
}
