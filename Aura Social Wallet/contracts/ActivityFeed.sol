// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ActivityFeed {
    struct Activity {
        uint256 id;
        address user;
        string actionType; // e.g. "SWAP", "MINT"
        string details;
        uint256 timestamp;
    }

    Activity[] public activities;
    uint256 public activityCount;

    event ActivityPosted(uint256 indexed id, address indexed user, string actionType);

    function postActivity(string memory _actionType, string memory _details) external {
        Activity memory newActivity = Activity({
            id: activityCount,
            user: msg.sender,
            actionType: _actionType,
            details: _details,
            timestamp: block.timestamp
        });

        activities.push(newActivity);
        emit ActivityPosted(activityCount, msg.sender, _actionType);
        activityCount++;
    }

    function getRecentActivities(uint256 count) external view returns (Activity[] memory) {
        uint256 size = count > activities.length ? activities.length : count;
        Activity[] memory recent = new Activity[](size);
        
        for (uint256 i = 0; i < size; i++) {
            recent[i] = activities[activities.length - 1 - i];
        }
        return recent;
    }
}
