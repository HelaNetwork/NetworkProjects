// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CryptoX {
    struct User {
        address walletAddress;
        bytes32 phoneHash;
        string name;
        string encryptedPrivateKey;
        bool exists;
    }

    struct PaymentRequest {
        address fromAddress;
        address toAddress;
        uint256 amount;
        string status;
        uint256 createdAt;
    }

    mapping(bytes32 => User) private usersByPhone;
    mapping(address => PaymentRequest[]) private paymentRequests;

    event UserRegistered(address indexed wallet, string name);
    event PaymentCreated(address indexed from, address indexed to, uint256 amount);

    function registerUser(
        string memory _phone,
        string memory _name,
        address _wallet,
        string memory _encryptedPrivateKey
    ) public {
        bytes32 phoneHash = keccak256(abi.encodePacked(_phone));
        require(!usersByPhone[phoneHash].exists, "User already exists");
        usersByPhone[phoneHash] = User(_wallet, phoneHash, _name, _encryptedPrivateKey, true);
        emit UserRegistered(_wallet, _name);
    }

    function getUser(string memory _phone) public view returns (address, string memory, string memory, bool) {
        bytes32 phoneHash = keccak256(abi.encodePacked(_phone));
        User memory user = usersByPhone[phoneHash];
        return (user.walletAddress, user.name, user.encryptedPrivateKey, user.exists);
    }

    function createPaymentRequest(address _to, uint256 _amount) public {
        paymentRequests[msg.sender].push(PaymentRequest(msg.sender, _to, _amount, "PENDING", block.timestamp));
        emit PaymentCreated(msg.sender, _to, _amount);
    }

    function getPaymentRequests(address _user) public view returns (PaymentRequest[] memory) {
        return paymentRequests[_user];
    }
}