// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IMove.sol";
import "./DeckWarsCard.sol";

/// @title DeckWarsGame - Core 1v1 card battle contract
/// @notice Implements a commit-reveal scheme for provably fair battles.
///         Each turn: both players commit a hash of (moveIndex + secret), 
///         then reveal. Combined seeds produce fair randomness for crit/miss.
contract DeckWarsGame {
    DeckWarsCard public immutable cardContract;

    enum GameStatus { 
        Open,       // Challenge issued, waiting for opponent
        Active,     // Battle in progress
        Finished,   // Battle completed
        Expired     // Timed out
    }

    enum CommitStatus { None, Committed, Revealed }

    struct PlayerState {
        address addr;
        uint256[3] cardIds;
        IMove.CardState[3] cards;
        uint8 activeCardIdx;
        bytes32 commitHash;     // hash(moveIndex ++ secret)
        uint8 revealedMove;     // move index revealed
        uint256 revealedSeed;   // secret revealed
        CommitStatus commitStatus;
        bool hasForfeited;
    }

    struct Game {
        uint256 id;
        PlayerState player1;
        PlayerState player2;
        GameStatus status;
        uint256 wager;          // in wei
        address winner;
        uint256 turnNumber;
        uint256 lastActionTime; // for timeout
        uint256 createdAt;
    }

    mapping(uint256 => Game) public games;
    uint256 public gameCounter;

    // Timeout: 5 minutes to act or forfeit automatically
    uint256 public constant TURN_TIMEOUT = 5 minutes;

    event ChallengeOpened(uint256 indexed gameId, address indexed challenger, address indexed opponent, uint256 wager);
    event ChallengeAccepted(uint256 indexed gameId, address indexed player2);
    event MoveCommitted(uint256 indexed gameId, address indexed player, uint256 turnNumber);
    event MoveRevealed(uint256 indexed gameId, address indexed player, uint8 moveIndex, uint256 turnNumber);
    event TurnResolved(uint256 indexed gameId, uint256 turnNumber, uint256 combinedSeed);
    event CardFainted(uint256 indexed gameId, bool player1Card, uint8 cardIdx);
    event GameOver(uint256 indexed gameId, address indexed winner, uint256 prize);
    event GameForfeited(uint256 indexed gameId, address indexed forfeiter);

    constructor(address _cardContract) {
        cardContract = DeckWarsCard(_cardContract);
    }

    /// @notice Open a challenge against a specific opponent, optionally with a wager
    function openChallenge(
        address opponent,
        uint256[3] calldata cardIds
    ) external payable returns (uint256) {
        require(opponent != msg.sender, "Cannot challenge yourself");
        require(opponent != address(0), "Invalid opponent");
        
        // Verify card ownership
        for (uint8 i = 0; i < 3; i++) {
            require(cardContract.ownerOf(cardIds[i]) == msg.sender, "You don't own this card");
        }

        gameCounter++;
        uint256 gameId = gameCounter;

        Game storage game = games[gameId];
        game.id = gameId;
        game.wager = msg.value;
        game.status = GameStatus.Open;
        game.createdAt = block.timestamp;
        game.lastActionTime = block.timestamp;
        game.turnNumber = 0;

        // Setup player 1 state
        game.player1.addr = msg.sender;
        game.player1.cardIds = cardIds;
        _loadPlayerCards(game.player1, cardIds);
        game.player1.activeCardIdx = 0;

        // Set expected opponent
        game.player2.addr = opponent;

        emit ChallengeOpened(gameId, msg.sender, opponent, msg.value);
        return gameId;
    }

    /// @notice Accept a challenge (called by the opponent)
    function acceptChallenge(
        uint256 gameId,
        uint256[3] calldata cardIds
    ) external payable {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Open, "Game not open");
        require(game.player2.addr == msg.sender, "Not the challenged player");
        require(msg.value == game.wager, "Must match wager");

        for (uint8 i = 0; i < 3; i++) {
            require(cardContract.ownerOf(cardIds[i]) == msg.sender, "You don't own this card");
        }

        game.player2.cardIds = cardIds;
        _loadPlayerCards(game.player2, cardIds);
        game.player2.activeCardIdx = 0;
        game.status = GameStatus.Active;
        game.lastActionTime = block.timestamp;

        emit ChallengeAccepted(gameId, msg.sender);
    }

    /// @notice Commit your move for this turn (hash of moveIndex + secret)
    function commitMove(uint256 gameId, bytes32 commitHash) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Game not active");
        
        bool isPlayer1 = (msg.sender == game.player1.addr);
        bool isPlayer2 = (msg.sender == game.player2.addr);
        require(isPlayer1 || isPlayer2, "Not a player");

        PlayerState storage player = isPlayer1 ? game.player1 : game.player2;
        require(player.commitStatus == CommitStatus.None, "Already committed");

        player.commitHash = commitHash;
        player.commitStatus = CommitStatus.Committed;
        game.lastActionTime = block.timestamp;

        emit MoveCommitted(gameId, msg.sender, game.turnNumber);

        // If both have committed, we wait for reveals
    }

    /// @notice Reveal your committed move
    function revealMove(uint256 gameId, uint8 moveIndex, uint256 secret) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Game not active");

        bool isPlayer1 = (msg.sender == game.player1.addr);
        bool isPlayer2 = (msg.sender == game.player2.addr);
        require(isPlayer1 || isPlayer2, "Not a player");

        PlayerState storage player = isPlayer1 ? game.player1 : game.player2;
        require(player.commitStatus == CommitStatus.Committed, "Must commit first");

        // Verify the reveal matches the commit
        bytes32 expectedHash = keccak256(abi.encodePacked(moveIndex, secret, msg.sender));
        require(player.commitHash == expectedHash, "Reveal doesn't match commit");

        // Validate move index
        DeckWarsCard.CardStats memory cs = cardContract.getCardStats(
            player.cardIds[player.activeCardIdx]
        );
        require(moveIndex < cs.moveCount, "Invalid move");

        player.revealedMove = moveIndex;
        player.revealedSeed = secret;
        player.commitStatus = CommitStatus.Revealed;

        emit MoveRevealed(gameId, msg.sender, moveIndex, game.turnNumber);

        // If both players revealed, resolve the turn
        if (game.player1.commitStatus == CommitStatus.Revealed &&
            game.player2.commitStatus == CommitStatus.Revealed) {
            _resolveTurn(gameId);
        }
    }

    /// @notice Forfeit the game — opponent wins
    function forfeit(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active || game.status == GameStatus.Open, "Game not in progress");
        require(msg.sender == game.player1.addr || msg.sender == game.player2.addr, "Not a player");

        address winner = (msg.sender == game.player1.addr) ? game.player2.addr : game.player1.addr;
        _endGame(gameId, winner);

        emit GameForfeited(gameId, msg.sender);
    }

    /// @notice Claim timeout victory if opponent hasn't acted in TURN_TIMEOUT
    function claimTimeout(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Game not active");
        require(block.timestamp > game.lastActionTime + TURN_TIMEOUT, "Timeout not reached");
        require(msg.sender == game.player1.addr || msg.sender == game.player2.addr, "Not a player");

        // The player who has acted (committed/revealed) wins on timeout
        address winner;
        bool p1Acted = game.player1.commitStatus != CommitStatus.None;
        bool p2Acted = game.player2.commitStatus != CommitStatus.None;

        if (p1Acted && !p2Acted) {
            winner = game.player1.addr;
        } else if (p2Acted && !p1Acted) {
            winner = game.player2.addr;
        } else {
            // Neither acted — challenger wins as default
            winner = game.player1.addr;
        }

        _endGame(gameId, winner);
    }

    // ─── Internal ───────────────────────────────────────────────────────────

    function _loadPlayerCards(PlayerState storage player, uint256[3] calldata cardIds) internal {
        for (uint8 i = 0; i < 3; i++) {
            DeckWarsCard.CardStats memory cs = cardContract.getCardStats(cardIds[i]);
            player.cards[i] = IMove.CardState({
                hp: cs.hp,
                maxHp: cs.maxHp,
                attack: cs.attack,
                defense: cs.defense,
                speed: cs.speed
            });
        }
    }

    function _resolveTurn(uint256 gameId) internal {
        Game storage game = games[gameId];

        // Combine both secrets for provably fair randomness
        uint256 combinedSeed = uint256(keccak256(abi.encodePacked(
            game.player1.revealedSeed,
            game.player2.revealedSeed,
            game.turnNumber
        )));

        emit TurnResolved(gameId, game.turnNumber, combinedSeed);

        // Build battle state from current game state
        IMove.BattleState memory state = _buildBattleState(game);

        // Determine action order by speed (faster card acts first)
        bool p1First = game.player1.cards[game.player1.activeCardIdx].speed >=
                       game.player2.cards[game.player2.activeCardIdx].speed;

        // Execute moves in speed order
        if (p1First) {
            state = _executePlayerMove(game, state, true, combinedSeed);
            if (!_isGameOver(state)) {
                state = _executePlayerMove(game, state, false, combinedSeed >> 128);
            }
        } else {
            state = _executePlayerMove(game, state, false, combinedSeed);
            if (!_isGameOver(state)) {
                state = _executePlayerMove(game, state, true, combinedSeed >> 128);
            }
        }

        // Sync battle state back to game
        _syncBattleState(game, state);

        // Check for fainted cards
        _checkFaintedCards(gameId, game);

        // Reset commit status for next turn
        game.player1.commitStatus = CommitStatus.None;
        game.player2.commitStatus = CommitStatus.None;
        game.turnNumber++;
        game.lastActionTime = block.timestamp;

        // Check win condition
        address winner = _checkWinner(game);
        if (winner != address(0)) {
            _endGame(gameId, winner);
        }
    }

    function _executePlayerMove(
        Game storage game,
        IMove.BattleState memory state,
        bool isPlayer1,
        uint256 seed
    ) internal returns (IMove.BattleState memory) {
        PlayerState storage player = isPlayer1 ? game.player1 : game.player2;
        uint8 moveIdx = player.revealedMove;
        uint256 activeCard = player.cardIds[player.activeCardIdx];

        DeckWarsCard.CardStats memory cs = cardContract.getCardStats(activeCard);
        address moveContract = cs.moves[moveIdx];

        if (moveContract != address(0)) {
            state = IMove(moveContract).execute(state, isPlayer1, seed);
        }
        return state;
    }

    function _buildBattleState(Game storage game) internal view returns (IMove.BattleState memory) {
        IMove.BattleState memory state;
        for (uint8 i = 0; i < 3; i++) {
            state.player1Cards[i] = game.player1.cards[i];
            state.player2Cards[i] = game.player2.cards[i];
        }
        state.player1ActiveIdx = game.player1.activeCardIdx;
        state.player2ActiveIdx = game.player2.activeCardIdx;
        state.player1Turn = true;
        return state;
    }

    function _syncBattleState(Game storage game, IMove.BattleState memory state) internal {
        for (uint8 i = 0; i < 3; i++) {
            game.player1.cards[i] = state.player1Cards[i];
            game.player2.cards[i] = state.player2Cards[i];
        }
    }

    function _checkFaintedCards(uint256 gameId, Game storage game) internal {
        // Auto-switch to next alive card if active card faints
        _autoSwitch(gameId, game.player1, true);
        _autoSwitch(gameId, game.player2, false);
    }

    function _autoSwitch(uint256 gameId, PlayerState storage player, bool isP1) internal {
        if (player.cards[player.activeCardIdx].hp == 0) {
            emit CardFainted(gameId, isP1, player.activeCardIdx);
            // Find next alive card
            for (uint8 i = 0; i < 3; i++) {
                if (player.cards[i].hp > 0) {
                    player.activeCardIdx = i;
                    return;
                }
            }
        }
    }

    function _isGameOver(IMove.BattleState memory state) internal pure returns (bool) {
        bool p1Dead = state.player1Cards[0].hp == 0 &&
                      state.player1Cards[1].hp == 0 &&
                      state.player1Cards[2].hp == 0;
        bool p2Dead = state.player2Cards[0].hp == 0 &&
                      state.player2Cards[1].hp == 0 &&
                      state.player2Cards[2].hp == 0;
        return p1Dead || p2Dead;
    }

    function _checkWinner(Game storage game) internal view returns (address) {
        bool p1Dead = game.player1.cards[0].hp == 0 &&
                      game.player1.cards[1].hp == 0 &&
                      game.player1.cards[2].hp == 0;
        bool p2Dead = game.player2.cards[0].hp == 0 &&
                      game.player2.cards[1].hp == 0 &&
                      game.player2.cards[2].hp == 0;

        if (p2Dead) return game.player1.addr;
        if (p1Dead) return game.player2.addr;
        return address(0);
    }

    function _endGame(uint256 gameId, address winner) internal {
        Game storage game = games[gameId];
        game.status = GameStatus.Finished;
        game.winner = winner;

        uint256 prize = game.wager * 2;
        if (prize > 0) {
            (bool sent, ) = winner.call{value: prize}("");
            require(sent, "Failed to send prize");
        }

        emit GameOver(gameId, winner, prize);
    }

    // ─── View functions ──────────────────────────────────────────────────────

    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    function getPlayerCards(uint256 gameId, bool isPlayer1) external view returns (IMove.CardState[3] memory) {
        if (isPlayer1) return games[gameId].player1.cards;
        return games[gameId].player2.cards;
    }

    function generateCommitHash(uint8 moveIndex, uint256 secret, address player) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(moveIndex, secret, player));
    }
}
