// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PredictionMarket.sol";

contract DeSciJournal is Ownable {
    struct Paper {
        uint256 id;
        address author;
        string title;
        string ipfsHash;
        address predictionMarket;
    }

    mapping(uint256 => Paper) public papers;
    uint256 public paperCount;

    event PaperPublished(uint256 indexed id, address author, string title, address market);

    function publishPaper(string memory _title, string memory _ipfsHash) external {
        PredictionMarket market = new PredictionMarket(msg.sender, paperCount);

        papers[paperCount] = Paper({
            id: paperCount,
            author: msg.sender,
            title: _title,
            ipfsHash: _ipfsHash,
            predictionMarket: address(market)
        });

        emit PaperPublished(paperCount, msg.sender, _title, address(market));
        paperCount++;
    }
}
