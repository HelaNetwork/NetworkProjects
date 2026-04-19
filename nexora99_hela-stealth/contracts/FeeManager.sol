// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FeeManager
 * @notice Collects protocol fees from payment address generation.
 */
contract FeeManager is Ownable {

    uint256 public protocolFee;        // fee in HUSD smallest units
    address public treasury;

    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event FeeCollected(address indexed from, uint256 amount);

    /**
     * @param _treasury  Address that receives protocol fees.
     * @param _fee       Initial protocol fee in HUSD (18 decimals). Default: 0.00402 HUSD = 4020000000000000 wei.
     */
    constructor(address _treasury, uint256 _fee) Ownable(msg.sender) {
        require(_treasury != address(0), "FeeManager: zero treasury");
        treasury = _treasury;
        protocolFee = _fee;
    }

    function setFee(uint256 _fee) external onlyOwner {
        uint256 old = protocolFee;
        protocolFee = _fee;
        emit FeeUpdated(old, _fee);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "FeeManager: zero treasury");
        address old = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(old, _treasury);
    }
}
