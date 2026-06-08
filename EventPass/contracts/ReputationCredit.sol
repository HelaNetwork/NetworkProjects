// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationCredit is Ownable {
    mapping(address => uint256) public reputationScores;
    mapping(address => uint256) public loans;

    event ScoreUpdated(address indexed user, uint256 newScore);
    event LoanTaken(address indexed user, uint256 amount);
    event LoanRepaid(address indexed user, uint256 amount);

    function updateScore(address user, uint256 score) external onlyOwner {
        reputationScores[user] = score;
        emit ScoreUpdated(user, score);
    }

    function borrow() external {
        require(reputationScores[msg.sender] >= 100, "Score too low");
        require(loans[msg.sender] == 0, "Already have a loan");
        require(address(this).balance >= 0.1 ether, "Not enough liquidity");

        loans[msg.sender] = 0.1 ether;
        payable(msg.sender).transfer(0.1 ether);
        emit LoanTaken(msg.sender, 0.1 ether);
    }

    function repay() external payable {
        require(loans[msg.sender] > 0, "No active loan");
        require(msg.value >= loans[msg.sender], "Insufficient repayment");

        uint256 overpayment = msg.value - loans[msg.sender];
        loans[msg.sender] = 0;
        
        reputationScores[msg.sender] += 10;
        emit ScoreUpdated(msg.sender, reputationScores[msg.sender]);
        emit LoanRepaid(msg.sender, loans[msg.sender]);

        if (overpayment > 0) {
            payable(msg.sender).transfer(overpayment);
        }
    }

    receive() external payable {}
}
