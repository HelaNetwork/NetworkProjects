// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SocialGraph {
    mapping(address => mapping(address => bool)) public isFollowing;
    mapping(address => uint256) public followerCount;
    mapping(address => uint256) public followingCount;

    event Followed(address indexed follower, address indexed following);
    event Unfollowed(address indexed follower, address indexed following);

    function follow(address _user) external {
        require(_user != msg.sender, "Cannot follow yourself");
        require(!isFollowing[msg.sender][_user], "Already following");

        isFollowing[msg.sender][_user] = true;
        followingCount[msg.sender]++;
        followerCount[_user]++;

        emit Followed(msg.sender, _user);
    }

    function unfollow(address _user) external {
        require(isFollowing[msg.sender][_user], "Not following");

        isFollowing[msg.sender][_user] = false;
        followingCount[msg.sender]--;
        followerCount[_user]--;

        emit Unfollowed(msg.sender, _user);
    }
}
