// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PredictionMarket {
    address public author;
    uint256 public paperId;
    
    uint256 public yesShares; // Valid/Replicable
    uint256 public noShares;  // Flawed/Invalid
    
    mapping(address => uint256) public userYesShares;
    mapping(address => uint256) public userNoShares;
    
    bool public isResolved;
    bool public paperIsValid;

    constructor(address _author, uint256 _paperId) {
        author = _author;
        paperId = _paperId;
    }

    function buyYes() external payable {
        require(!isResolved, "Market resolved");
        require(msg.value > 0, "Must send ETH");
        
        yesShares += msg.value;
        userYesShares[msg.sender] += msg.value;
    }

    function buyNo() external payable {
        require(!isResolved, "Market resolved");
        require(msg.value > 0, "Must send ETH");
        
        noShares += msg.value;
        userNoShares[msg.sender] += msg.value;
    }

    function resolve(bool _isValid) external {
        require(!isResolved, "Already resolved");
        isResolved = true;
        paperIsValid = _isValid;
    }

    function claimWinnings() external {
        require(isResolved, "Not resolved");
        uint256 payout = 0;
        
        if (paperIsValid) {
            uint256 share = userYesShares[msg.sender];
            require(share > 0, "No winning shares");
            userYesShares[msg.sender] = 0;
            
            uint256 totalPool = yesShares + noShares;
            payout = (share * totalPool) / yesShares;
        } else {
            uint256 share = userNoShares[msg.sender];
            require(share > 0, "No winning shares");
            userNoShares[msg.sender] = 0;
            
            uint256 totalPool = yesShares + noShares;
            payout = (share * totalPool) / noShares;
        }
        
        payable(msg.sender).transfer(payout);
    }
}
