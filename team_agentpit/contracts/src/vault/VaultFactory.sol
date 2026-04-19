// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {UserVault} from "./UserVault.sol";

contract VaultFactory {
    mapping(address => address) public userVaults;
    event VaultCreated(address indexed user, address vault);

    error VaultAlreadyExists();

    function createVault() external {
        if (userVaults[msg.sender] != address(0)) {
            revert VaultAlreadyExists();
        }

        UserVault vault = new UserVault(msg.sender);
        userVaults[msg.sender] = address(vault);
        emit VaultCreated(msg.sender, address(vault));
    }

    function getVault(address user) external view returns (address) {
        return userVaults[user];
    }

    function getVaultBalance(address user) external view returns (uint256) {
        address vaultAddress = userVaults[user];
        if (vaultAddress == address(0)) {
            return 0;
        }
        UserVault vault = UserVault(vaultAddress);
        return vault.getBalance(user);
    }
}
