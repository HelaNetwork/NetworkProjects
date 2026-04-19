// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StealthRegistry
 * @notice Allows merchants to register their wallet and meta-public-key
 *         so the protocol can derive one-time stealth payment addresses.
 */
contract StealthRegistry {

    struct Merchant {
        address wallet;
        bytes   metaPublicKey; // compressed public key for stealth derivation
        bool    registered;
        uint256 registeredAt;
    }

    mapping(address => Merchant) public merchants;
    address[] public merchantList;

    event MerchantRegistered(address indexed wallet, bytes metaPublicKey, uint256 timestamp);
    event MerchantUpdated(address indexed wallet, bytes metaPublicKey, uint256 timestamp);

    modifier onlyRegistered() {
        require(merchants[msg.sender].registered, "StealthRegistry: not registered");
        _;
    }

    /**
     * @notice Register as a merchant.
     * @param metaPublicKey  The merchant's meta-public-key used for stealth address generation.
     */
    function registerMerchant(bytes calldata metaPublicKey) external {
        require(metaPublicKey.length > 0, "StealthRegistry: empty key");
        require(!merchants[msg.sender].registered, "StealthRegistry: already registered");

        merchants[msg.sender] = Merchant({
            wallet: msg.sender,
            metaPublicKey: metaPublicKey,
            registered: true,
            registeredAt: block.timestamp
        });

        merchantList.push(msg.sender);
        emit MerchantRegistered(msg.sender, metaPublicKey, block.timestamp);
    }

    /**
     * @notice Update meta-public-key.
     */
    function updateMetaKey(bytes calldata metaPublicKey) external onlyRegistered {
        require(metaPublicKey.length > 0, "StealthRegistry: empty key");
        merchants[msg.sender].metaPublicKey = metaPublicKey;
        emit MerchantUpdated(msg.sender, metaPublicKey, block.timestamp);
    }

    /**
     * @notice Check if an address is a registered merchant.
     */
    function isMerchant(address addr) external view returns (bool) {
        return merchants[addr].registered;
    }

    /**
     * @notice Get the total number of registered merchants.
     */
    function getMerchantCount() external view returns (uint256) {
        return merchantList.length;
    }
}
