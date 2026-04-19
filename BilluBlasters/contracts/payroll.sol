// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract PayStream {
    address public owner;
    uint256 public totalAllocated;
    uint256 private streamIdCounter = 1;

    // Precision scaling factor (1e18 for maximum precision)
    uint256 private constant PRECISION = 1e18;

    mapping(uint256 => Stream) public streams;
    
    event Funded(address indexed sender, uint256 amount);
    event StreamCreated(uint256 indexed id, address indexed worker, uint256 amount);
    event StreamStateChanged(uint256 indexed id, StreamState newState);
    event Withdrawn(uint256 indexed id, address indexed worker, uint256 amount);
    event EmergencyWithdraw(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == owner, "Not admin");
        _;
    }

    enum StreamType { Continuous, OneTime }
    enum StreamState { Active, Completed, Cancelled, Paused }

    struct Stream {
        uint256 deposit;              // Total amount to be streamed
        uint256 withdrawn;            // Amount already withdrawn
        uint256 ratePerSecond;        // Scaled by PRECISION (amount per second * 1e18)
        uint256 startTime;            // Stream start timestamp
        uint256 endTime;              // Stream end timestamp
        uint256 pausedTime;           // Timestamp when paused
        uint256 totalPausedDuration;  // Cumulative paused time in seconds
        StreamType streamType;
        StreamState state;
        address workerAddr;
    }

    // Funding functions
    function fundSystem() external payable {
        require(msg.value > 0, "Must send funds");
        emit Funded(msg.sender, msg.value);
    }

    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }

    // View available balance
    function availableBalance() public view returns (uint256) {
        return address(this).balance - totalAllocated;
    }

    // Create a new payment stream with high-precision rate calculation
    function createStream(
        StreamType sType,
        address workerAddr,
        uint256 amount,
        uint256 durationOrEndTime
    ) external onlyAdmin returns (uint256) {
        require(workerAddr != address(0), "Invalid worker address");
        require(amount > 0, "Amount must be > 0");
        require(availableBalance() >= amount, "Insufficient contract balance");

        uint256 ratePerSecond = 0;
        uint256 end = 0;
        uint256 duration = 0;

        if (sType == StreamType.OneTime) {
            require(durationOrEndTime > block.timestamp, "End time must be in future");
            end = durationOrEndTime;
            duration = end - block.timestamp;
        } else {
            require(durationOrEndTime > 0, "Duration must be > 0");
            duration = durationOrEndTime;
            end = block.timestamp + duration;
        }

        // HIGH PRECISION CALCULATION
        // ratePerSecond = (amount * PRECISION) / duration
        // This gives us 18 decimal places of precision
        ratePerSecond = (amount * PRECISION) / duration;
        
        // Validate that rate calculation won't cause issues
        require(ratePerSecond > 0, "Amount too small for duration");

        uint256 streamId = streamIdCounter;
        
        streams[streamId] = Stream({
            deposit: amount,
            withdrawn: 0,
            ratePerSecond: ratePerSecond,
            startTime: block.timestamp,
            endTime: end,
            pausedTime: 0,
            totalPausedDuration: 0,
            streamType: sType,
            state: StreamState.Active,
            workerAddr: workerAddr
        });

        totalAllocated += amount;
        emit StreamCreated(streamId, workerAddr, amount);
        streamIdCounter++;
        
        return streamId;
    }

    // HIGH PRECISION: Calculate claimable amount with minimal rounding errors
    function calculateClaimable(uint256 streamId) public view returns (uint256) {
        Stream storage s = streams[streamId];
        
        if (s.state == StreamState.Completed || s.state == StreamState.Cancelled) {
            return 0;
        }

        uint256 effectiveCurrentTime = block.timestamp;

        // If currently paused, calculate up to pause time only
        if (s.state == StreamState.Paused) {
            effectiveCurrentTime = s.pausedTime;
        }

        // Calculate elapsed time excluding paused periods
        if (effectiveCurrentTime <= s.startTime) {
            return 0;
        }

        uint256 timeElapsed = effectiveCurrentTime - s.startTime - s.totalPausedDuration;

        // Adjusted end time accounting for pauses
        uint256 adjustedEndTime = s.endTime + s.totalPausedDuration;
        
        uint256 totalVested;
        
        if (effectiveCurrentTime >= adjustedEndTime) {
            // Stream has ended, all funds are vested
            totalVested = s.deposit;
        } else {
            // HIGH PRECISION CALCULATION
            // totalVested = (timeElapsed * ratePerSecond) / PRECISION
            // Using full precision arithmetic
            uint256 vestedScaled = timeElapsed * s.ratePerSecond;
            totalVested = vestedScaled / PRECISION;
            
            // Safety cap: never exceed deposit (handles rounding edge cases)
            if (totalVested > s.deposit) {
                totalVested = s.deposit;
            }
        }

        // Return claimable amount (vested minus already withdrawn)
        return totalVested > s.withdrawn ? totalVested - s.withdrawn : 0;
    }

    // Get the exact streaming rate per second (returns actual wei/second)
    function getStreamRate(uint256 streamId) external view returns (uint256) {
        Stream storage s = streams[streamId];
        // Return actual rate in wei per second (scaled down)
        return s.ratePerSecond / PRECISION;
    }

    // Get the high-precision streaming rate (scaled by 1e18)
    function getStreamRatePrecise(uint256 streamId) external view returns (uint256) {
        Stream storage s = streams[streamId];
        return s.ratePerSecond;
    }

    // Worker withdraws from their stream
    function withdraw(uint256 streamId) external {
        Stream storage s = streams[streamId];
        
        require(msg.sender == s.workerAddr, "Not your stream");
        require(s.state != StreamState.Completed, "Stream completed");
        require(s.state != StreamState.Cancelled, "Stream cancelled");

        uint256 claimable = calculateClaimable(streamId);
        require(claimable > 0, "No funds available");
        require(address(this).balance >= claimable, "Insufficient contract balance");

        // Update state BEFORE transfer (reentrancy protection)
        s.withdrawn += claimable;
        totalAllocated -= claimable;

        // Mark as completed if fully withdrawn
        if (s.withdrawn >= s.deposit) {
            s.state = StreamState.Completed;
            emit StreamStateChanged(streamId, StreamState.Completed);
        }

        // Transfer funds
        (bool success, ) = payable(msg.sender).call{value: claimable}("");
        require(success, "Transfer failed");

        emit Withdrawn(streamId, msg.sender, claimable);
    }

    // Function to change stream state (owner only)
    function setState(uint256 streamId, StreamState newState) external onlyAdmin {
        Stream storage s = streams[streamId];
        require(s.deposit > 0, "Stream does not exist");
        require(s.state != StreamState.Completed, "Cannot modify completed stream");

        StreamState oldState = s.state;
        
        if (newState == StreamState.Paused && oldState == StreamState.Active) {
            s.pausedTime = block.timestamp;
            s.state = StreamState.Paused;
            
        } else if (newState == StreamState.Active && oldState == StreamState.Paused) {
            require(s.pausedTime > 0, "Stream was not paused");
            
            uint256 pauseDuration = block.timestamp - s.pausedTime;
            s.totalPausedDuration += pauseDuration;
            s.endTime += pauseDuration;
            
            s.pausedTime = 0;
            s.state = StreamState.Active;
            
        } else if (newState == StreamState.Cancelled) {
            s.state = StreamState.Cancelled;
            
        } else {
            revert("Invalid state transition");
        }

        emit StreamStateChanged(streamId, newState);
    }

    // Emergency function - pause all streams and withdraw funds
    function emergency() external onlyAdmin {
        // Pause all active streams
        for (uint256 i = 1; i < streamIdCounter; i++) {
            Stream storage s = streams[i];
            if (s.state == StreamState.Active) {
                s.pausedTime = block.timestamp;
                s.state = StreamState.Paused;
                emit StreamStateChanged(i, StreamState.Paused);
            }
        }

        uint256 availableFunds = availableBalance();
        
        if (availableFunds > 0) {
            (bool success, ) = payable(owner).call{value: availableFunds}("");
            require(success, "Emergency transfer failed");
            emit EmergencyWithdraw(owner, availableFunds);
        }
    }

    // Get detailed stream info with precise calculations
    function getStreamInfo(uint256 streamId) external view returns (
        uint256 deposit,
        uint256 withdrawn,
        uint256 claimable,
        uint256 ratePerSecond,
        uint256 startTime,
        uint256 endTime,
        StreamType streamType,
        StreamState state,
        address worker
    ) {
        Stream storage s = streams[streamId];
        return (
            s.deposit,
            s.withdrawn,
            calculateClaimable(streamId),
            s.ratePerSecond / PRECISION, // Return in wei/second
            s.startTime,
            s.endTime,
            s.streamType,
            s.state,
            s.workerAddr
        );
    }

    // Advanced: Calculate vesting at any specific timestamp (for simulations)
    function calculateVestedAtTime(uint256 streamId, uint256 timestamp) external view returns (uint256) {
        Stream storage s = streams[streamId];
        require(timestamp >= s.startTime, "Time before stream start");

        uint256 effectiveTime = timestamp;
        if (s.state == StreamState.Paused && timestamp > s.pausedTime) {
            effectiveTime = s.pausedTime;
        }

        uint256 timeElapsed = effectiveTime - s.startTime - s.totalPausedDuration;
        uint256 adjustedEndTime = s.endTime + s.totalPausedDuration;

        if (effectiveTime >= adjustedEndTime) {
            return s.deposit;
        }

        uint256 vestedScaled = timeElapsed * s.ratePerSecond;
        uint256 totalVested = vestedScaled / PRECISION;

        return totalVested > s.deposit ? s.deposit : totalVested;
    }

    // Verify stream calculation accuracy (returns remaining dust after full vesting)
    function calculateRoundingError(uint256 streamId) external view returns (uint256) {
        Stream storage s = streams[streamId];
        
        uint256 duration = s.endTime - s.startTime;
        uint256 calculatedTotal = (duration * s.ratePerSecond) / PRECISION;
        
        // The difference is the rounding error
        if (calculatedTotal > s.deposit) {
            return calculatedTotal - s.deposit;
        } else {
            return s.deposit - calculatedTotal;
        }
    }

    // Transfer ownership
    function transferOwnership(address newOwner) external onlyAdmin {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
```

## Key Precision Improvements:

### 1. **Scaling Factor (1e18)**
- Uses `PRECISION = 1e18` for 18 decimal places
- Rate stored as: `ratePerSecond = (amount * 1e18) / duration`
- Calculation: `vested = (timeElapsed * ratePerSecond) / 1e18`

### 2. **Accuracy Example**
```
Streaming 1 ETH over 1 year:
- Traditional: rate = 1e18 / 31536000 = 31709 wei/sec (loses precision)
- High Precision: rate = (1e18 * 1e18) / 31536000 = 31709791983764586 (scaled)
- Actual per second: 31709791983764586 / 1e18 = 0.031709791983764586 ETH/sec