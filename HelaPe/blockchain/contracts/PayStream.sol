// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PayStream is Ownable, ReentrancyGuard {
    struct Stream {
        address sender;
        address recipient;
        uint256 deposit;
        uint256 startTime;
        uint256 stopTime;
        uint256 ratePerSecond;
        uint256 withdrawn;
        bool active;
        bool paused;
        uint256 pausedTime;
        uint256 totalPausedDuration;
        uint256 yieldAccrued;
        uint256 lastYieldCalculation;
    }

    struct BonusSpike {
        uint256 amount;
        uint256 timestamp;
        string reason;
    }

    IERC20 public paymentToken;
    address public taxVault;
    uint256 public constant TAX_RATE = 1000; // 10% (Basis points: 1000/10000)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant YIELD_RATE = 500; // 5% APY (Basis points: 500/10000)
    uint256 public constant SECONDS_PER_YEAR = 31536000;
    
    mapping(uint256 => Stream) public streams;
    mapping(uint256 => bool) public streamExists;
    mapping(uint256 => BonusSpike[]) public streamBonuses;
    mapping(address => uint256[]) private senderStreams;
    uint256 public nextStreamId;

    event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 ratePerSecond, uint256 deposit, uint256 startTime);
    event Withdrawn(uint256 indexed streamId, address indexed recipient, uint256 amount, uint256 tax);
    event StreamCancelled(uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 refundAmount);
    event StreamPaused(uint256 indexed streamId, address indexed sender);
    event StreamResumed(uint256 indexed streamId, address indexed sender);
    event BonusSpikeAdded(uint256 indexed streamId, uint256 amount, string reason);
    event YieldEarned(uint256 indexed streamId, uint256 yieldAmount);

    constructor(address _paymentToken, address _taxVault) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        taxVault = _taxVault;
    }

    function createStream(
        uint256 streamId,
        address recipient,
        uint256 ratePerSecond,
        uint256 deposit,
        uint256 startTime
    ) external nonReentrant returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(deposit > 0, "Deposit must be > 0");
        require(ratePerSecond > 0, "Rate must be > 0");
        require(!streamExists[streamId], "Stream ID already exists");
        require(startTime >= block.timestamp, "Start time must be in future or now");
        
        uint256 duration = deposit / ratePerSecond;
        require(duration > 0, "Deposit too small for rate");

        // Transfer tokens to contract
        require(paymentToken.transferFrom(msg.sender, address(this), deposit), "Transfer failed");
        
        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            deposit: deposit,
            startTime: startTime,
            stopTime: startTime + duration,
            ratePerSecond: ratePerSecond,
            withdrawn: 0,
            active: true,
            paused: false,
            pausedTime: 0,
            totalPausedDuration: 0,
            yieldAccrued: 0,
            lastYieldCalculation: startTime
        });

        streamExists[streamId] = true;
        senderStreams[msg.sender].push(streamId);

        if (streamId >= nextStreamId) {
            nextStreamId = streamId + 1;
        }

        emit StreamCreated(streamId, msg.sender, recipient, ratePerSecond, deposit, startTime);
        return streamId;
    }

    function calculateYield(uint256 streamId) internal returns (uint256) {
        Stream storage stream = streams[streamId];
        
        if (!stream.active || stream.paused) {
            return 0;
        }

        uint256 currentTime = block.timestamp;
        if (currentTime <= stream.lastYieldCalculation) {
            return 0;
        }

        // Calculate yield on unwithdawn balance
        uint256 balance = stream.deposit - stream.withdrawn;
        uint256 timeElapsed = currentTime - stream.lastYieldCalculation;
        
        // Simple interest: Principal * Rate * Time / (Seconds per year * Basis Points)
        uint256 yieldAmount = (balance * YIELD_RATE * timeElapsed) / (SECONDS_PER_YEAR * BASIS_POINTS);
        
        stream.yieldAccrued += yieldAmount;
        stream.lastYieldCalculation = currentTime;
        
        if (yieldAmount > 0) {
            emit YieldEarned(streamId, yieldAmount);
        }
        
        return yieldAmount;
    }

    function getVestedAmount(uint256 streamId) public view returns (uint256) {
        Stream memory stream = streams[streamId];
        
        uint256 currentTime = block.timestamp;
        if (currentTime < stream.startTime) {
            return 0;
        }
        
        // If stream is currently paused, use pausedTime instead of current time
        if (stream.paused && stream.pausedTime > 0) {
            currentTime = stream.pausedTime;
        }
        
        if (currentTime > stream.stopTime) {
            currentTime = stream.stopTime;
        }

        // Calculate elapsed time excluding paused duration
        uint256 elapsedTime = currentTime - stream.startTime;
        
        // Subtract total paused duration from elapsed time
        if (elapsedTime > stream.totalPausedDuration) {
            elapsedTime -= stream.totalPausedDuration;
        } else {
            elapsedTime = 0;
        }
        
        uint256 vested = elapsedTime * stream.ratePerSecond;
        
        if (vested > stream.deposit) {
            vested = stream.deposit;
        }
        
        // Add bonuses to vested amount
        BonusSpike[] memory bonuses = streamBonuses[streamId];
        for (uint256 i = 0; i < bonuses.length; i++) {
            if (bonuses[i].timestamp <= currentTime) {
                vested += bonuses[i].amount;
            }
        }
        
        return vested;
    }

    function getTotalAvailable(uint256 streamId) public view returns (uint256) {
        Stream memory stream = streams[streamId];
        uint256 vested = getVestedAmount(streamId);
        
        // Calculate pending yield (view function, doesn't update state)
        // Don't calculate yield if stream is paused
        uint256 pendingYield = 0;
        if (!stream.paused && stream.active) {
            uint256 balance = stream.deposit - stream.withdrawn;
            uint256 timeElapsed = block.timestamp - stream.lastYieldCalculation;
            pendingYield = (balance * YIELD_RATE * timeElapsed) / (SECONDS_PER_YEAR * BASIS_POINTS);
        }
        
        return vested + stream.yieldAccrued + pendingYield - stream.withdrawn;
    }

    function getStream(uint256 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }

    function getStreamBonuses(uint256 streamId) external view returns (BonusSpike[] memory) {
        return streamBonuses[streamId];
    }

    function addBonusSpike(
        uint256 streamId,
        uint256 amount,
        string memory reason
    ) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.sender, "Only sender can add bonus");
        require(stream.active, "Stream not active");
        require(amount > 0, "Bonus must be > 0");

        // Transfer bonus tokens to contract
        require(paymentToken.transferFrom(msg.sender, address(this), amount), "Bonus transfer failed");
        
        streamBonuses[streamId].push(BonusSpike({
            amount: amount,
            timestamp: block.timestamp,
            reason: reason
        }));

        emit BonusSpikeAdded(streamId, amount, reason);
    }

    function withdraw(uint256 streamId, uint256 amount) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.recipient || msg.sender == stream.sender, "Unauthorized");
        require(amount > 0, "Amount must be > 0");

        // Calculate and accrue yield first (only if active and not paused)
        if (stream.active && !stream.paused) {
            calculateYield(streamId);
        }

        uint256 totalAvailable = getTotalAvailable(streamId);
        require(totalAvailable >= amount, "Amount exceeds available funds");

        stream.withdrawn += amount;

        // Apply Tax
        uint256 taxAmount = (amount * TAX_RATE) / BASIS_POINTS;
        uint256 netAmount = amount - taxAmount;

        require(paymentToken.transfer(taxVault, taxAmount), "Tax transfer failed");
        require(paymentToken.transfer(stream.recipient, netAmount), "Recipient transfer failed");

        emit Withdrawn(streamId, stream.recipient, netAmount, taxAmount);

        // Deactivate if fully withdrawn
        if (stream.withdrawn >= stream.deposit + stream.yieldAccrued) {
            stream.active = false;
        }
    }

    function cancelStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.sender || msg.sender == stream.recipient, "Unauthorized");
        require(stream.active, "Stream not active");

        // Calculate final yield (but only pay if funds available)
        calculateYield(streamId);

        uint256 vested = getVestedAmount(streamId);
        
        // Calculate total bonuses
        uint256 totalBonuses = 0;
        BonusSpike[] memory bonuses = streamBonuses[streamId];
        for (uint256 i = 0; i < bonuses.length; i++) {
            totalBonuses += bonuses[i].amount;
        }
        
        // Only consider actual deposited funds for refund calculation
        uint256 totalDeposit = stream.deposit + totalBonuses;
        uint256 vestedBase = vested > totalDeposit ? totalDeposit : vested;
        uint256 unvested = totalDeposit > vestedBase ? totalDeposit - vestedBase : 0;

        stream.active = false;
        stream.stopTime = block.timestamp;

        // Refund unvested to sender
        if (unvested > 0) {
            require(paymentToken.transfer(stream.sender, unvested), "Refund failed");
        }
        
        // Don't automatically transfer vested amount - let employee withdraw manually
        emit StreamCancelled(streamId, stream.sender, stream.recipient, unvested);
    }

    function pauseStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.sender, "Only sender can pause");
        require(stream.active, "Stream not active");
        require(!stream.paused, "Stream already paused");
        require(block.timestamp >= stream.startTime, "Stream hasn't started yet");
        
        // Calculate yield before pausing
        calculateYield(streamId);
        
        stream.paused = true;
        stream.pausedTime = block.timestamp;
        
        emit StreamPaused(streamId, msg.sender);
    }

    function resumeStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.sender, "Only sender can resume");
        require(stream.active, "Stream not active");
        require(stream.paused, "Stream not paused");
        
        uint256 pauseDuration = block.timestamp - stream.pausedTime;
        stream.totalPausedDuration += pauseDuration;
        
        // Extend stop time by the paused duration
        stream.stopTime += pauseDuration;
        
        stream.paused = false;
        stream.pausedTime = 0;
        stream.lastYieldCalculation = block.timestamp; // Reset yield calculation on resume
        
        emit StreamResumed(streamId, msg.sender);
    }

    function getSenderStreams(address sender) external view returns (uint256[] memory) {
        return senderStreams[sender];
    }
}
