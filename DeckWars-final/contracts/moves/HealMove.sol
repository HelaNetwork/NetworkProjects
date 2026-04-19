// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IMove.sol";

/// @title HealMove - Restores HP to the active card
/// @notice Heals the active card for 30% of its max HP
contract HealMove is IMove {
    function execute(
        BattleState memory state,
        bool actorIsPlayer1,
        uint256 randomSeed
    ) external pure override returns (BattleState memory) {
        // Heal amount: 25-35% of maxHp based on randomSeed
        uint256 healPct = 25 + (randomSeed % 11); // 25-35%

        if (actorIsPlayer1) {
            uint8 idx = state.player1ActiveIdx;
            uint256 healAmount = (state.player1Cards[idx].maxHp * healPct) / 100;
            uint256 newHp = state.player1Cards[idx].hp + healAmount;
            // Cap at maxHp
            state.player1Cards[idx].hp = newHp > state.player1Cards[idx].maxHp 
                ? state.player1Cards[idx].maxHp 
                : newHp;
        } else {
            uint8 idx = state.player2ActiveIdx;
            uint256 healAmount = (state.player2Cards[idx].maxHp * healPct) / 100;
            uint256 newHp = state.player2Cards[idx].hp + healAmount;
            state.player2Cards[idx].hp = newHp > state.player2Cards[idx].maxHp 
                ? state.player2Cards[idx].maxHp 
                : newHp;
        }

        return state;
    }

    function name() external pure override returns (string memory) {
        return "Heal";
    }

    function description() external pure override returns (string memory) {
        return "Restore 25-35% of max HP to your active card. Amount varies slightly by chance.";
    }

    function power() external pure override returns (uint8) {
        return 30;
    }
}
