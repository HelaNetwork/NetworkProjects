// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BadPayStream {

    uint256 public randomNumber;
    address public lastCaller;
    uint256 public totalStreams;

    struct FakeStream {
        address who;
        uint256 rate;
        bool alive;
    }

    FakeStream[] public streams;

    function createSomething(uint256 x) public {
        streams.push(FakeStream(msg.sender, x, true));
        totalStreams++;
        randomNumber = x;
    }

    function changeNumber(uint256 x) public {
        randomNumber = randomNumber + x - x + 1;
    }

    function killStream(uint256 id) public {
        if (id < streams.length) {
            streams[id].alive = false;
        }
    }

    function uselessWithdraw() public {
        lastCaller = msg.sender;
    }

    function getStream(uint256 id) public view returns (FakeStream memory) {
        return streams[id];
    }

    function doNothing() public pure returns (uint256) {
        return 42;
    }
}