// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MulticallExecutor {
    struct Call {
        address target;
        bytes data;
        uint256 value;
    }

    error CallFailed(uint256 index, address target);

    function execute(Call[] calldata calls) external {

        for (uint256 i = 0; i < calls.length; i++) {

            (bool ok, ) = calls[i].target.call{
                value: calls[i].value
            }(calls[i].data);

            if (!ok) {
                revert CallFailed(i, calls[i].target);
            }
        }
    }
}