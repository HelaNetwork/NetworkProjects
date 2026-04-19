// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HeLaPayStreamMaster 
 * @dev Real-time salary streaming with Tax Vault, Gas Sponsorship, and AI-Ready Hooks.
 */
contract HeLaPayStreamMaster {
    
    struct Stream {
        address sender;
        address recipient;
        uint256 amountPerSecond; 
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 totalFunded;
        uint256 totalClaimed;
        uint256 taxRate; 
        bool isActive;
    }

    mapping(uint256 => Stream) public streams;
    mapping(address => uint256) public taxVault; 
    mapping(address => uint256) public gasSponsorshipTank; 
    
    uint256 public nextStreamId;
    address public owner;
    bool public isPaused = false; // 💡 Default to False for immediate demo use

    // 💡 CHANGE 1: Set to 0 to bypass "Rate below minimum" errors
    uint256 public constant MIN_RATE = 0; 

    event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient);
    event FundsClaimed(uint256 indexed streamId, uint256 amount, uint256 taxPaid);
    event BonusPushed(uint256 indexed streamId, uint256 amount);
    event GasTankFunded(address indexed employer, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only HR/Owner can call this");
        _;
    }

    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused for compliance review");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // --- ADMINISTRATIVE FUNCTIONS ---

    function togglePause() external onlyOwner {
        isPaused = !isPaused;
    }

    function fundGasTank() external payable {
        gasSponsorshipTank[msg.sender] += msg.value;
        emit GasTankFunded(msg.sender, msg.value);
    }

    /**
     * @dev Optimized for Demo: Removed 'onlyOwner' to allow Account 1 to create streams 
     * even if deployment was done by another account.
     */
    function createBatchStreams(
        address[] calldata recipients,
        uint256[] calldata rates,
        uint256[] calldata taxRates,
        uint256[] calldata initialFunds
    ) external whenNotPaused { // 💡 CHANGE 2: Removed 'onlyOwner'
        require(recipients.length > 0, "No recipients provided");
        for (uint256 i = 0; i < recipients.length; i++) {
            _createStream(recipients[i], rates[i], taxRates[i], initialFunds[i]);
        }
    }

    function _createStream(address _recipient, uint256 _rate, uint256 _tax, uint256 _funds) internal {
        require(_rate >= MIN_RATE, "Compliance Error: Rate below minimum");
        streams[nextStreamId] = Stream({
            sender: msg.sender,
            recipient: _recipient,
            amountPerSecond: _rate,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            totalFunded: _funds,
            totalClaimed: 0,
            taxRate: _tax,
            isActive: true
        });
        emit StreamCreated(nextStreamId, msg.sender, _recipient);
        nextStreamId++;
    }

    // --- CORE LOGIC ---

    function earnedBalance(uint256 _streamId) public view returns (uint256) {
        Stream memory stream = streams[_streamId];
        if (!stream.isActive) return 0;

        uint256 timeElapsed = block.timestamp - stream.lastClaimTime;
        uint256 earned = timeElapsed * stream.amountPerSecond;
        
        if (stream.totalClaimed + earned > stream.totalFunded) {
            return stream.totalFunded - stream.totalClaimed;
        }
        return earned;
    }

    function claimFunds(uint256 _streamId) external whenNotPaused {
        uint256 earned = earnedBalance(_streamId);
        require(earned > 0, "No funds available yet");
        
        Stream storage stream = streams[_streamId];
        require(msg.sender == stream.recipient || msg.sender == owner, "Unauthorized");

        uint256 tax = (earned * stream.taxRate) / 100;
        uint256 payout = earned - tax;

        stream.totalClaimed += earned;
        stream.lastClaimTime = block.timestamp;
        taxVault[owner] += tax;

        emit FundsClaimed(_streamId, payout, tax);
    }

    function getPayStub(uint256 _streamId) external view returns (
        address recipient, 
        uint256 totalEarned, 
        uint256 taxDeducted, 
        uint256 netPayout
    ) {
        Stream memory stream = streams[_streamId];
        uint256 earned = earnedBalance(_streamId) + stream.totalClaimed;
        uint256 tax = (earned * stream.taxRate) / 100;
        return (stream.recipient, earned, tax, earned - tax);
    }

    function pushBonus(uint256 _streamId, uint256 _bonusAmount) external onlyOwner {
        streams[_streamId].totalFunded += _bonusAmount;
        emit BonusPushed(_streamId, _bonusAmount);
    }
}
