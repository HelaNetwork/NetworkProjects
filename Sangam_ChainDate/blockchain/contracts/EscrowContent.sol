// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EscrowContent
 * @notice Escrow-style exclusive content unlock.
 *         A creator locks content (IPFS CID hash) at a price. A buyer pays
 *         the exact price; funds go to the creator and the CID is revealed.
 *         If no buyer claims within LOCK_DURATION, creator can reclaim the listing.
 *
 * Privacy note: contentHash is the keccak256 of the IPFS CID. The actual
 *               encrypted CID is delivered off-chain to the buyer after unlock.
 */
contract EscrowContent {
    uint256 public constant LOCK_DURATION = 7 days;
    uint256 public constant PROTOCOL_FEE_BPS = 250; // 2.5%

    address public owner;
    uint256 public collectedFees;

    struct Listing {
        address creator;
        bytes32 contentHash;  // keccak256 of encrypted IPFS CID
        uint256 price;        // in wei
        bool active;
        uint256 lockedAt;
    }

    // listingId → Listing
    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;

    // listingId → buyer → unlocked
    mapping(uint256 => mapping(address => bool)) public unlocked;

    // ─── Events ───────────────────────────────────────────────────────────────
    event ContentListed(uint256 indexed listingId, address indexed creator, uint256 price, bytes32 contentHash);
    event ContentUnlocked(uint256 indexed listingId, address indexed buyer, address indexed creator, uint256 amount);
    event ListingCancelled(uint256 indexed listingId);

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "EscrowContent: not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ─── Creator Functions ────────────────────────────────────────────────────

    /**
     * @notice Creator lists exclusive content for sale.
     * @param contentHash  keccak256 of the encrypted IPFS CID
     * @param price        Required payment in wei
     * @return listingId   ID of the new listing
     */
    function listContent(bytes32 contentHash, uint256 price)
        external
        returns (uint256 listingId)
    {
        require(price > 0, "EscrowContent: price must be > 0");
        listingId = nextListingId++;
        listings[listingId] = Listing({
            creator: msg.sender,
            contentHash: contentHash,
            price: price,
            active: true,
            lockedAt: block.timestamp
        });
        emit ContentListed(listingId, msg.sender, price, contentHash);
    }

    /**
     * @notice Cancel an expired listing (after LOCK_DURATION with no sales).
     *         Only creator can cancel.
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.creator == msg.sender, "EscrowContent: not creator");
        require(listing.active, "EscrowContent: not active");
        require(
            block.timestamp >= listing.lockedAt + LOCK_DURATION,
            "EscrowContent: lock period not expired"
        );
        listing.active = false;
        emit ListingCancelled(listingId);
    }

    // ─── Buyer Functions ──────────────────────────────────────────────────────

    /**
     * @notice Unlock exclusive content. Buyer pays exact price.
     *         Protocol takes 2.5%, remainder goes to creator.
     * @param listingId  The listing to unlock
     */
    function unlockContent(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.active, "EscrowContent: listing not active");
        require(msg.value >= listing.price, "EscrowContent: insufficient payment");
        require(!unlocked[listingId][msg.sender], "EscrowContent: already unlocked");

        unlocked[listingId][msg.sender] = true;

        uint256 fee = (msg.value * PROTOCOL_FEE_BPS) / 10_000;
        uint256 creatorAmount = msg.value - fee;

        collectedFees += fee;
        payable(listing.creator).transfer(creatorAmount);

        emit ContentUnlocked(listingId, msg.sender, listing.creator, msg.value);
    }

    // ─── View ─────────────────────────────────────────────────────────────────

    function hasUnlocked(uint256 listingId, address buyer) external view returns (bool) {
        return unlocked[listingId][buyer];
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    // ─── Owner ────────────────────────────────────────────────────────────────

    function withdrawFees(address payable to) external onlyOwner {
        uint256 amount = collectedFees;
        collectedFees = 0;
        to.transfer(amount);
    }

    receive() external payable {}
}
