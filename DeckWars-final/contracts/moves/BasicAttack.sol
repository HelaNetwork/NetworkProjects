// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IMove.sol";

/// @title BasicAttack - Simple physical attack move
/// @notice Deals (attack - defense) damage with a small random variance
contract BasicAttack is IMove {
    function execute(
        BattleState memory state,
        bool actorIsPlayer1,
        uint256 randomSeed
    ) external pure override returns (BattleState memory) {
        CardState memory attacker;
        CardState memory defender;
        uint8 defenderIdx;

        if (actorIsPlayer1) {
            attacker = state.player1Cards[state.player1ActiveIdx];
            defenderIdx = state.player2ActiveIdx;
            defender = state.player2Cards[defenderIdx];
        } else {
            attacker = state.player2Cards[state.player2ActiveIdx];
            defenderIdx = state.player1ActiveIdx;
            defender = state.player1Cards[defenderIdx];
        }

        // Random variance: +/- 10% based on seed
        uint256 variance = (randomSeed % 21); // 0-20
        uint256 baseDamage = attacker.attack > defender.defense 
            ? attacker.attack - defender.defense 
            : 1;
        
        // Apply variance: 90% to 110% of base damage
        uint256 damage = (baseDamage * (90 + variance)) / 100;
        if (damage == 0) damage = 1;

        // Check for critical hit (10% chance based on seed bits)
        if ((randomSeed >> 8) % 10 == 0) {
            damage = (damage * 150) / 100; // 1.5x crit
        }

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
        return "Basic Attack";
    }

    function description() external pure override returns (string memory) {
        return "A standard physical attack. Deals ATK-DEF damage with random variance. 10% critical hit chance.";
    }

    function power() external pure override returns (uint8) {
        return 50;
    }
}
