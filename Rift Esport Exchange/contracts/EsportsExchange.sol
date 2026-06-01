// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EsportsExchange is Ownable {
    uint256 public constant FEE_PERCENT = 1; // 1% fee
    
    struct Bet {
        address creator;
        address taker;
        uint256 amount;
        string matchId;
        uint8 creatorTeamPrediction; // 1 or 2
        bool resolved;
        uint8 winningTeam;
    }

    mapping(uint256 => Bet) public bets;
    uint256 public betCount;

    event BetCreated(uint256 indexed betId, address creator, uint256 amount, string matchId);
    event BetTaken(uint256 indexed betId, address taker);
    event BetResolved(uint256 indexed betId, address winner, uint256 payout);

    function createBet(string memory _matchId, uint8 _teamPrediction) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_teamPrediction == 1 || _teamPrediction == 2, "Invalid prediction");

        bets[betCount] = Bet({
            creator: msg.sender,
            taker: address(0),
            amount: msg.value,
            matchId: _matchId,
            creatorTeamPrediction: _teamPrediction,
            resolved: false,
            winningTeam: 0
        });

        emit BetCreated(betCount, msg.sender, msg.value, _matchId);
        betCount++;
    }

    function takeBet(uint256 _betId) external payable {
        Bet storage bet = bets[_betId];
        require(bet.creator != address(0), "Bet does not exist");
        require(bet.taker == address(0), "Bet already taken");
        require(msg.value == bet.amount, "Must match bet amount");

        bet.taker = msg.sender;
        emit BetTaken(_betId, msg.sender);
    }

    function resolveBet(uint256 _betId, uint8 _winningTeam) external onlyOwner {
        Bet storage bet = bets[_betId];
        require(bet.taker != address(0), "Bet not taken yet");
        require(!bet.resolved, "Bet already resolved");
        require(_winningTeam == 1 || _winningTeam == 2, "Invalid winning team");

        bet.resolved = true;
        bet.winningTeam = _winningTeam;

        uint256 totalPool = bet.amount * 2;
        uint256 fee = (totalPool * FEE_PERCENT) / 100;
        uint256 payout = totalPool - fee;

        address winner;
        if (bet.creatorTeamPrediction == _winningTeam) {
            winner = bet.creator;
        } else {
            winner = bet.taker;
        }

        payable(winner).transfer(payout);
        emit BetResolved(_betId, winner, payout);
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
