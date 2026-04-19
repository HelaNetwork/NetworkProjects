// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockZKVerifier.sol";

/**
 * @title DatingCore
 * @notice Privacy-first on-chain dating logic for Hela Network.
 *         Profiles are stored as encrypted hashes; raw PII never hits the chain.
 *         Swipes require a micro-fee (SWIPE_FEE). A mutual like triggers a
 *         ZK-proof match verification before emitting MatchFound.
 */
contract DatingCore {
    // ─── Constants ────────────────────────────────────────────────────────────
    uint256 public constant SWIPE_FEE = 0.001 ether;   // ~$0.001 on Hela
    uint256 public constant MSG_FEE   = 0.0005 ether;  // pay-per-message

    // ─── State ────────────────────────────────────────────────────────────────
    MockZKVerifier public immutable zkVerifier;
    address public owner;
    uint256 public collectedFees;

    struct Profile {
        bytes32 encryptedHash;   // AES-encrypted IPFS CID of profile JSON
        uint8[] interests;       // encoded interest IDs (1-20)
        bool active;
        uint256 registeredAt;
    }

    // user → Profile
    mapping(address => Profile) public profiles;

    // swiper → swipee → liked
    mapping(address => mapping(address => bool)) public swipes;

    // pair hash → matched
    mapping(bytes32 => bool) public matches;

    // match pair hash → encrypted chat channel key (set off-chain, stored on-chain)
    mapping(bytes32 => bytes) public chatKeys;

    // ─── Events ───────────────────────────────────────────────────────────────
    event ProfileRegistered(address indexed user, bytes32 encryptedHash);
    event SwipeRecorded(address indexed swiper, address indexed target, bool liked);
    event MatchFound(address indexed userA, address indexed userB, bytes32 pairHash);
    event MessageSent(address indexed sender, address indexed recipient, uint256 feePaid);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "DatingCore: not owner");
        _;
    }

    modifier profileExists(address user) {
        require(profiles[user].active, "DatingCore: profile not found");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address _zkVerifier) {
        zkVerifier = MockZKVerifier(_zkVerifier);
        owner = msg.sender;
    }

    // ─── Profile Management ───────────────────────────────────────────────────

    /**
     * @notice Register or update an encrypted profile.
     * @param encryptedHash  keccak256 or AES-encrypted IPFS CID of user data
     * @param interests      Array of interest IDs (max 10)
     */
    function registerProfile(
        bytes32 encryptedHash,
        uint8[] calldata interests
    ) external {
        require(interests.length <= 10, "DatingCore: max 10 interests");
        profiles[msg.sender] = Profile({
            encryptedHash: encryptedHash,
            interests: interests,
            active: true,
            registeredAt: block.timestamp
        });
        emit ProfileRegistered(msg.sender, encryptedHash);
    }

    /**
     * @notice Deactivate own profile.
     */
    function deactivateProfile() external profileExists(msg.sender) {
        profiles[msg.sender].active = false;
    }

    // ─── Swiping ──────────────────────────────────────────────────────────────

    /**
     * @notice Swipe on a target profile. Requires SWIPE_FEE.
     * @param target  Address of the profile being swiped on
     * @param liked   true = like, false = pass
     * @param proof         ZK proof bytes (from client ZK generation)
     * @param publicSignals ZK public signals [ageValid, interestOverlap]
     */
    function swipe(
        address target,
        bool liked,
        bytes calldata proof,
        uint256[] calldata publicSignals
    ) external payable profileExists(msg.sender) profileExists(target) {
        require(target != msg.sender, "DatingCore: cannot swipe self");
        require(msg.value >= SWIPE_FEE, "DatingCore: insufficient swipe fee");
        require(!swipes[msg.sender][target], "DatingCore: already swiped");

        // ZK verification — proves swiper is 18+ and shares ≥1 interest
        bool zkOk = zkVerifier.verifyProof(proof, publicSignals);
        require(zkOk, "DatingCore: ZK proof invalid");

        swipes[msg.sender][target] = liked;
        collectedFees += msg.value;

        emit SwipeRecorded(msg.sender, target, liked);

        // Check mutual like → match
        if (liked && swipes[target][msg.sender]) {
            bytes32 pairHash = _pairHash(msg.sender, target);
            if (!matches[pairHash]) {
                matches[pairHash] = true;
                emit MatchFound(msg.sender, target, pairHash);
            }
        }
    }

    // ─── Messaging ────────────────────────────────────────────────────────────

    /**
     * @notice Pay-per-message. Fee split: 80% to recipient, 20% to protocol.
     * @param recipient  The matched user to message
     */
    function sendMessage(address recipient)
        external
        payable
        profileExists(msg.sender)
        profileExists(recipient)
    {
        require(msg.value >= MSG_FEE, "DatingCore: insufficient message fee");

        // Require an existing match
        bytes32 pairHash = _pairHash(msg.sender, recipient);
        require(matches[pairHash], "DatingCore: not matched");

        uint256 protocolCut = msg.value / 5;      // 20%
        uint256 recipientCut = msg.value - protocolCut; // 80%

        collectedFees += protocolCut;
        payable(recipient).transfer(recipientCut);

        emit MessageSent(msg.sender, recipient, msg.value);
    }

    // ─── Chat Key Storage ─────────────────────────────────────────────────────

    /**
     * @notice Store an encrypted shared key for E2E chat between matched users.
     * @param partner   The matched partner's address
     * @param encKey    AES-encrypted shared channel key
     */
    function storeChatKey(address partner, bytes calldata encKey) external {
        bytes32 pairHash = _pairHash(msg.sender, partner);
        require(matches[pairHash], "DatingCore: not matched");
        chatKeys[pairHash] = encKey;
    }

    // ─── View Helpers ─────────────────────────────────────────────────────────

    function isMatched(address a, address b) external view returns (bool) {
        return matches[_pairHash(a, b)];
    }

    function getInterests(address user) external view returns (uint8[] memory) {
        return profiles[user].interests;
    }

    // ─── Owner ────────────────────────────────────────────────────────────────

    function withdrawFees(address payable to) external onlyOwner {
        uint256 amount = collectedFees;
        collectedFees = 0;
        to.transfer(amount);
        emit FeesWithdrawn(to, amount);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    /// @dev Canonical pair hash — order-independent
    function _pairHash(address a, address b) internal pure returns (bytes32) {
        return a < b
            ? keccak256(abi.encodePacked(a, b))
            : keccak256(abi.encodePacked(b, a));
    }

    receive() external payable {}
}
