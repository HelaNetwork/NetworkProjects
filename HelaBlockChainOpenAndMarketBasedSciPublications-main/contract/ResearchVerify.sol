// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// =====================================================
// ResearchVerify — Store paper hashes on HeLa chain
// Gas paid in HLUSD (HeLa's native stablecoin)
// =====================================================

contract ResearchVerify {

    // One record per uploaded paper
    struct PaperRecord {
        string  hash;       // SHA256 hash from backend
        address uploader;   // wallet that submitted
        uint256 timestamp;  // block timestamp
    }

    PaperRecord[] private records;

    // Fired when new hash stored — frontend listens to this
    event HashAdded(
        address indexed uploader,
        string  hash,
        uint256 timestamp
    );

    // --- Write ---
    function addHash(string memory hash) public {
        records.push(PaperRecord({
            hash:      hash,
            uploader:  msg.sender,
            timestamp: block.timestamp
        }));

        emit HashAdded(msg.sender, hash, block.timestamp);
    }

    // --- Read ---
    function getAllHashes() public view returns (PaperRecord[] memory) {
        return records;
    }

    function getRecord(uint256 index) public view returns (PaperRecord memory) {
        require(index < records.length, "Out of range");
        return records[index];
    }

    function totalRecords() public view returns (uint256) {
        return records.length;
    }
}
