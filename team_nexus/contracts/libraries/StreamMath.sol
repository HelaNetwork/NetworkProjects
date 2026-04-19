// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StreamMath
 * @notice Pure math library for payroll stream calculations.
 * @dev All arithmetic uses uint256 to avoid floating-point issues.
 *      Tax is expressed in basis points (1 bp = 0.01%).
 */
library StreamMath {
    /// @notice Calculates the total accrued amount for a given rate and elapsed time.
    /// @param ratePerSecond  Tokens earned per second (in token smallest unit).
    /// @param elapsedSeconds Number of seconds since last claim.
    /// @return accrued Total tokens accrued.
    function calculateAccrued(
        uint256 ratePerSecond,
        uint256 elapsedSeconds
    ) internal pure returns (uint256 accrued) {
        accrued = ratePerSecond * elapsedSeconds;
    }

    /// @notice Splits a gross amount into employee share and tax share.
    /// @param grossAmount   Total accrued tokens.
    /// @param taxBasisPoints Tax rate in basis points (e.g. 1000 = 10%).
    /// @return employeeShare Amount the employee receives.
    /// @return taxShare      Amount sent to the tax vault.
    function splitTax(
        uint256 grossAmount,
        uint256 taxBasisPoints
    ) internal pure returns (uint256 employeeShare, uint256 taxShare) {
        require(taxBasisPoints <= 10000, "StreamMath: tax > 100%");
        taxShare = (grossAmount * taxBasisPoints) / 10000;
        employeeShare = grossAmount - taxShare;
    }
}
