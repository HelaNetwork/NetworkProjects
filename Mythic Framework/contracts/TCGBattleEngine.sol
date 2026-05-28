// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TCGBattleEngine is Ownable {
    struct PlayerState {
        address player;
        uint256 hp;
        uint256 deckCount;
        uint256[] boardCards;
    }

    struct MatchState {
        uint256 seasonId;
        PlayerState p1;
        PlayerState p2;
        address currentTurn;
        uint256 turnTimerExpires;
        bool isResolved;
        address winner;
    }

    mapping(uint256 => MatchState) public matches;
    uint256 public matchCount;
    uint256 public currentSeasonId = 1;

    uint256 public constant TURN_DURATION = 60; // 60 seconds

    event MatchCreated(uint256 indexed matchId, address p1, address p2);
    event TurnEnded(uint256 indexed matchId, address nextTurn);
    event MatchEnded(uint256 indexed matchId, address winner);

    function createMatch(address _p1, address _p2) external onlyOwner {
        uint256[] memory emptyBoard;

        PlayerState memory state1 = PlayerState({
            player: _p1,
            hp: 30,
            deckCount: 30,
            boardCards: emptyBoard
        });

        PlayerState memory state2 = PlayerState({
            player: _p2,
            hp: 30,
            deckCount: 30,
            boardCards: emptyBoard
        });

        matches[matchCount] = MatchState({
            seasonId: currentSeasonId,
            p1: state1,
            p2: state2,
            currentTurn: _p1,
            turnTimerExpires: block.timestamp + TURN_DURATION,
            isResolved: false,
            winner: address(0)
        });

        emit MatchCreated(matchCount, _p1, _p2);
        matchCount++;
    }

    function endTurn(uint256 _matchId) external {
        MatchState storage m = matches[_matchId];
        require(!m.isResolved, "Match already ended");
        
        // Either the player ends their turn, or anyone can end it if timer expired
        require(msg.sender == m.currentTurn || block.timestamp > m.turnTimerExpires, "Not your turn");

        if (m.currentTurn == m.p1.player) {
            m.currentTurn = m.p2.player;
        } else {
            m.currentTurn = m.p1.player;
        }

        m.turnTimerExpires = block.timestamp + TURN_DURATION;
        emit TurnEnded(_matchId, m.currentTurn);
    }

    function resolveMatch(uint256 _matchId, address _winner) external onlyOwner {
        MatchState storage m = matches[_matchId];
        require(!m.isResolved, "Already resolved");
        
        m.isResolved = true;
        m.winner = _winner;
        
        emit MatchEnded(_matchId, _winner);
    }
}
