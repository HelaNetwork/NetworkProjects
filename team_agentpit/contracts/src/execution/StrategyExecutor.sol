// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IUserVault {
    function delegateExecute(
        address target,
        bytes calldata data
    ) external returns (bytes memory);
}

interface IERC8004 {
    function getScore(address agent)
        external
        view
        returns (uint256);

    function recordSuccess(address agent) external;
}

interface IMulticall {
    function execute(bytes calldata data) external;
}

contract StrategyExecutor {

    IERC8004 public registry;
    address public multicallExecutor;

    uint256 public constant MIN_REPUTATION = 5000;

    constructor(
        address _registry,
        address _multicall
    ) {
        registry = IERC8004(_registry);
        multicallExecutor = _multicall;
    }

    struct Call {
        address target;
        bytes data;
        uint256 value;
    }

    struct StrategyProposal {
        address vault;
        address agent;
        Call[] calls;
    }

    function executeStrategy(
        StrategyProposal calldata proposal
    ) external {
        bytes memory encoded = abi.encodeWithSignature(
            "execute((address,bytes,uint256)[])",
            proposal.calls
        );

        IUserVault(proposal.vault).delegateExecute(
            multicallExecutor,
            encoded
        );
    }
}