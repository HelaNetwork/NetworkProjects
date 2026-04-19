// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title OffRamp
 * @notice Secure HLUSD to INR conversion with cryptographically verified exchange rates
 * @dev Uses ECDSA signature verification to prevent rate manipulation
 */
contract OffRamp {
    using ECDSA for bytes32;

    // ========== STATE VARIABLES ==========

    /// @notice Contract owner for admin functions
    address public owner;

    /// @notice Immutable oracle signer address - only this address can sign valid rates
    address public immutable oracleSigner;

    /// @notice Transaction fee percentage (1% = 1)
    uint256 public feePercent = 1;

    /// @notice Total HLUSD converted (excluding fees)
    uint256 public totalVolumeHLUSD;

    /// @notice Total fees collected in HLUSD
    uint256 public totalFeesCollected;

    /// @notice Total number of conversions
    uint256 public totalConversions;

    /// @notice Time window for rate validity (prevents stale rates)
    uint256 public constant RATE_VALIDITY_WINDOW = 5 minutes;

    // ========== STRUCTS ==========

    /// @notice Stores conversion details for tracking and history
    struct Conversion {
        address user;
        uint256 hlusdAmount;
        uint256 inrAmount;
        uint256 feeAmount;
        uint256 rateUsed;
        uint256 timestamp;
    }

    // ========== MAPPINGS ==========

    /// @notice All conversions indexed by ID
    mapping(uint256 => Conversion) public conversions;

    /// @notice Conversion IDs for each user
    mapping(address => uint256[]) public userConversions;

    // ========== EVENTS ==========

    event ConversionExecuted(
        uint256 indexed conversionId,
        address indexed user,
        uint256 hlusdAmount,
        uint256 inrAmount,
        uint256 feeAmount,
        uint256 rateUsed,
        uint256 timestamp
    );

    event FeesWithdrawn(address indexed recipient, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ========== MODIFIERS ==========

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // ========== CONSTRUCTOR ==========

    /**
     * @notice Initialize OffRamp contract with oracle signer
     * @param _oracleSigner Address authorized to sign exchange rates
     */
    constructor(address _oracleSigner) {
        require(_oracleSigner != address(0), "Invalid signer");
        oracleSigner = _oracleSigner;
        owner = msg.sender;
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @notice Hash rate and timestamp for signature verification
     * @param rate Exchange rate (HLUSD -> INR, scaled by 1e18)
     * @param timestamp Unix timestamp when rate was signed
     * @return Hash of the rate data
     */
    function _hashRate(uint256 rate, uint256 timestamp)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(rate, timestamp));
    }

    /**
     * @notice Verify that rate signature is valid and not expired
     * @param rate Exchange rate to verify
     * @param timestamp Rate timestamp
     * @param signature ECDSA signature from oracle
     * @return true if signature is valid and rate is fresh
     */
    function _verify(
        uint256 rate,
        uint256 timestamp,
        bytes memory signature
    ) internal view returns (bool) {
        // Check rate is not expired
        require(
            block.timestamp <= timestamp + RATE_VALIDITY_WINDOW,
            "Rate expired"
        );

        // Recreate the signed message hash
        bytes32 messageHash = _hashRate(rate, timestamp);
        bytes32 ethSigned = messageHash.toEthSignedMessageHash();

        // Recover signer and verify it matches oracle
        return ethSigned.recover(signature) == oracleSigner;
    }

    // ========== PUBLIC FUNCTIONS ==========

    /**
     * @notice Convert HLUSD to INR using cryptographically verified exchange rate
     * @param rate Exchange rate (HLUSD -> INR, scaled by 1e18)
     * @param timestamp Rate signing timestamp
     * @param signature ECDSA signature from oracle signer
     * @dev Requires sending HLUSD as msg.value
     */
    function convertToFiat(
        uint256 rate,
        uint256 timestamp,
        bytes calldata signature
    ) external payable {
        require(msg.value > 0, "Amount required");
        require(_verify(rate, timestamp, signature), "Invalid rate signature");

        // Calculate fee and net amount
        uint256 feeAmount = (msg.value * feePercent) / 100;
        uint256 netAmount = msg.value - feeAmount;

        // Calculate INR output
        uint256 inrOut = (netAmount * rate) / 1e18;

        // Store conversion record
        conversions[totalConversions] = Conversion({
            user: msg.sender,
            hlusdAmount: msg.value,
            inrAmount: inrOut,
            feeAmount: feeAmount,
            rateUsed: rate,
            timestamp: block.timestamp
        });

        // Add to user's conversion history
        userConversions[msg.sender].push(totalConversions);

        // Update totals
        totalVolumeHLUSD += netAmount;
        totalFeesCollected += feeAmount;

        emit ConversionExecuted(
            totalConversions,
            msg.sender,
            msg.value,
            inrOut,
            feeAmount,
            rate,
            block.timestamp
        );

        totalConversions++;
    }

    /**
     * @notice Get all conversion IDs for a user
     * @param user User address
     * @return Array of conversion IDs
     */
    function getUserConversions(address user)
        external
        view
        returns (uint256[] memory)
    {
        return userConversions[user];
    }

    /**
     * @notice Get conversion details by ID
     * @param conversionId Conversion ID
     * @return Conversion struct with all details
     */
    function getConversion(uint256 conversionId)
        external
        view
        returns (Conversion memory)
    {
        return conversions[conversionId];
    }

    /**
     * @notice Get total stats
     * @return volume Total HLUSD volume (net)
     * @return fees Total fees collected
     * @return count Total conversion count
     */
    function getStats()
        external
        view
        returns (
            uint256 volume,
            uint256 fees,
            uint256 count
        )
    {
        return (totalVolumeHLUSD, totalFeesCollected, totalConversions);
    }

    /**
     * @notice Withdraw collected fees (owner only)
     * @param recipient Address to receive fees
     */
    function withdrawFees(address payable recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        uint256 amount = totalFeesCollected;
        require(amount > 0, "No fees to withdraw");

        totalFeesCollected = 0;

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit FeesWithdrawn(recipient, amount);
    }

    /**
     * @notice Transfer ownership to a new address
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @notice Update the fee percentage
     * @param _feePercent New fee percentage (0-10)
     */
    function setFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 10, "Fee too high");
        feePercent = _feePercent;
    }

    /**
     * @notice Fallback function to receive HLUSD
     */
    receive() external payable {}
}
