// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IMove.sol";

/// @title HeavyStrike - High damage attack with miss chance
/// @notice Deals 200% attack damage but has 30% miss chance based on randomSeed
contract HeavyStrike is IMove {
    function execute(
        BattleState memory state,
        bool actorIsPlayer1,
        uint256 randomSeed
    ) external pure override returns (BattleState memory) {
        // 30% miss chance
        if (randomSeed % 10 < 3) {
            // Miss — return state unchanged
            return state;
        }

        CardState memory attacker;
        uint8 defenderIdx;

        if (actorIsPlayer1) {
            attacker = state.player1Cards[state.player1ActiveIdx];
            defenderIdx = state.player2ActiveIdx;
        } else {
            attacker = state.player2Cards[state.player2ActiveIdx];
            defenderIdx = state.player1ActiveIdx;
        }

        // Heavy strike: 200% attack, ignores half of defense
        uint256 defender_defense = actorIsPlayer1 
            ? state.player2Cards[defenderIdx].defense 
            : state.player1Cards[defenderIdx].defense;
        
        uint256 effectiveDefense = defender_defense / 2;
        uint256 baseAtk = attacker.attack * 2;
        uint256 damage = baseAtk > effectiveDefense ? baseAtk - effectiveDefense : 1;

        if (actorIsPlayer1) {
            if (damage >= state.player2Cards[defenderIdx].hp) {
                state.player2Cards[defenderIdx].hp = 0;
            } else {
                state.player2Cards[defenderIdx].hp -= damage;
            }
        } else {
            if (damage >= state.player1Cards[defenderIdx].hp) {
                state.player1Cards[defenderIdx].hp = 0;
            } else {
                state.player1Cards[defenderIdx].hp -= damage;
            }
        }

        return state;
    }

    function name() external pure override returns (string memory) {
        return "Heavy Strike";
    }

    function description() external pure override returns (string memory) {
        return "A devastating blow dealing 200% ATK damage. Ignores half of DEF but has 30% miss chance.";
    }

    function power() external pure override returns (uint8) {
        return 80;
    }
}
