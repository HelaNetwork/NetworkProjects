// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IMove.sol";

/// @title Shield - Defensive move that boosts own defense
/// @notice Increases the active card's defense by 50% for the remainder of the turn
contract Shield is IMove {
    function execute(
        BattleState memory state,
        bool actorIsPlayer1,
        uint256 /*randomSeed*/
    ) external pure override returns (BattleState memory) {
        // Boost active card's defense by 50%
        if (actorIsPlayer1) {
            uint8 idx = state.player1ActiveIdx;
            state.player1Cards[idx].defense = (state.player1Cards[idx].defense * 150) / 100;
        } else {
            uint8 idx = state.player2ActiveIdx;
            state.player2Cards[idx].defense = (state.player2Cards[idx].defense * 150) / 100;
        }
        return state;
    }

    function name() external pure override returns (string memory) {
        return "Shield";
    }

    function description() external pure override returns (string memory) {
        return "Raise your guard! Increases active card's DEF by 50% for this turn.";
    }

    function power() external pure override returns (uint8) {
        return 0;
    }
}
