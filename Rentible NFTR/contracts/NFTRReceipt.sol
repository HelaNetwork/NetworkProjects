// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTRReceipt is ERC721, Ownable {
    uint256 public nextReceiptId;

    struct Receipt {
        string receiptType; // e.g., "Yield Pass", "Lease-to-Own", "Vesting"
        uint256 unlockTimestamp;
        uint256 valueLocked;
        bool isRedeemed;
    }

    mapping(uint256 => Receipt) public receipts;

    event ReceiptMinted(uint256 indexed id, address indexed owner, string receiptType, uint256 unlockTimestamp);
    event ReceiptRedeemed(uint256 indexed id, address indexed owner);

    constructor() ERC721("NFTR Time Receipt", "NFTR") {}

    function mintTimeLockedReceipt(
        address _to,
        string memory _receiptType,
        uint256 _durationSeconds
    ) external payable {
        uint256 receiptId = nextReceiptId;
        nextReceiptId++;

        receipts[receiptId] = Receipt({
            receiptType: _receiptType,
            unlockTimestamp: block.timestamp + _durationSeconds,
            valueLocked: msg.value,
            isRedeemed: false
        });

        _mint(_to, receiptId);
        emit ReceiptMinted(receiptId, _to, _receiptType, receipts[receiptId].unlockTimestamp);
    }

    function redeemReceipt(uint256 _receiptId) external {
        require(ownerOf(_receiptId) == msg.sender, "Not the receipt owner");
        Receipt storage r = receipts[_receiptId];
        
        require(block.timestamp >= r.unlockTimestamp, "Time lock has not expired");
        require(!r.isRedeemed, "Already redeemed");

        r.isRedeemed = true;
        
        if (r.valueLocked > 0) {
            payable(msg.sender).transfer(r.valueLocked);
        }

        emit ReceiptRedeemed(_receiptId, msg.sender);
    }
}
