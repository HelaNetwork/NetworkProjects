// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TaxVault
 * @notice Receives tax portion from PayStream claims; owner can withdraw
 */
contract TaxVault is Ownable {
    using SafeERC20 for IERC20;

    constructor(address initialOwner) Ownable(initialOwner) {}

    event Withdrawn(address indexed token, address to, uint256 amount);
    event WithdrawnNative(address to, uint256 amount);
    event Received(address from, uint256 amount);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function withdraw(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
        emit Withdrawn(token, to, amount);
    }

    function withdrawNative(address to, uint256 amount) external onlyOwner {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");
        emit WithdrawnNative(to, amount);
    }
}
