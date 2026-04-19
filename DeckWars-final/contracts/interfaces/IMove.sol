// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IMove - Interface for all DeckWars move contracts
/// @notice Each move (attack, heal, shield, etc.) is a separate contract implementing this interface.
///         This makes the game composable and extensible — new moves can be deployed by anyone.
interface IMove {
    struct CardState {
        uint256 hp;
        uint256 maxHp;
        uint256 attack;
        uint256 defense;
        uint256 speed;
    }

    struct BattleState {
        CardState[3] player1Cards; // bench cards
        CardState[3] player2Cards;
        uint8 player1ActiveIdx;   // index of active card
        uint8 player2ActiveIdx;
        bool player1Turn;         // whose turn it is
    }

    /// @notice Execute this move and return the updated battle state
    /// @param state Current battle state
    /// @param actorIsPlayer1 True if player1 is using this move
    /// @param randomSeed Provably fair random seed derived from commit-reveal
    /// @return Updated battle state
    function execute(
        BattleState memory state,
        bool actorIsPlayer1,
        uint256 randomSeed
    ) external pure returns (BattleState memory);

    /// @notice Human-readable name of this move
    function name() external pure returns (string memory);

    /// @notice Description of what this move does
    function description() external pure returns (string memory);

    /// @notice Move power rating (0-100) for display purposes
    function power() external pure returns (uint8);
}
