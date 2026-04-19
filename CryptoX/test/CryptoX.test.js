const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");

describe("CryptoX", function () {
  let cryptoX;
  let owner;
  let user1;
  let user2;

  // Deploy a fresh contract before each test
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const CryptoX = await ethers.getContractFactory("CryptoX");
    cryptoX = await CryptoX.deploy();
    await cryptoX.waitForDeployment();
  });

  // ─── User Registration ────────────────────────────────────────────────────

  describe("User registration", function () {
    it("Should register a new user successfully", async function () {
      await cryptoX.connect(owner).registerUser(
        "919999999999",
        "Parth Verma",
        user1.address,
        "encryptedkey123"
      );

      const [walletAddress, name, encryptedKey, exists] =
        await cryptoX.getUser("919999999999");

      expect(exists).to.equal(true);
      expect(walletAddress).to.equal(user1.address);
      expect(name).to.equal("Parth Verma");
      expect(encryptedKey).to.equal("encryptedkey123");
    });

    it("Should not register the same phone number twice", async function () {
      await cryptoX.connect(owner).registerUser(
        "919999999999",
        "Parth Verma",
        user1.address,
        "encryptedkey123"
      );

      await expect(
        cryptoX.connect(owner).registerUser(
          "919999999999",
          "Parth Verma",
          user1.address,
          "encryptedkey123"
        )
      ).to.be.revertedWith("User already exists");
    });

    it("Should return exists=false for unregistered phone", async function () {
      const [walletAddress, name, encryptedKey, exists] =
        await cryptoX.getUser("910000000000");

      expect(exists).to.equal(false);
      expect(walletAddress).to.equal(ethers.ZeroAddress);
    });

    it("Should register multiple different users", async function () {
      await cryptoX.connect(owner).registerUser(
        "919999999999",
        "Parth Verma",
        user1.address,
        "encryptedkey1"
      );

      await cryptoX.connect(owner).registerUser(
        "918888888888",
        "Raghav Arora",
        user2.address,
        "encryptedkey2"
      );

      const [addr1, , , exists1] = await cryptoX.getUser("919999999999");
      const [addr2, , , exists2] = await cryptoX.getUser("918888888888");

      expect(exists1).to.equal(true);
      expect(exists2).to.equal(true);
      expect(addr1).to.equal(user1.address);
      expect(addr2).to.equal(user2.address);
    });

    it("Should emit UserRegistered event on registration", async function () {
      await expect(
        cryptoX.connect(owner).registerUser(
          "919999999999",
          "Parth Verma",
          user1.address,
          "encryptedkey123"
        )
      )
        .to.emit(cryptoX, "UserRegistered")
        .withArgs(user1.address, "Parth Verma");
    });
  });

  // ─── Payment Requests ─────────────────────────────────────────────────────

  describe("Payment requests", function () {
    it("Should create a payment request successfully", async function () {
      const amount = ethers.parseEther("5");

      await cryptoX.connect(user1).createPaymentRequest(user2.address, amount);

      const requests = await cryptoX.getPaymentRequests(user1.address);

      expect(requests.length).to.equal(1);
      expect(requests[0].fromAddress).to.equal(user1.address);
      expect(requests[0].toAddress).to.equal(user2.address);
      expect(requests[0].amount).to.equal(amount);
      expect(requests[0].status).to.equal("PENDING");
    });

    it("Should store multiple payment requests for same user", async function () {
      const amount1 = ethers.parseEther("5");
      const amount2 = ethers.parseEther("10");

      await cryptoX.connect(user1).createPaymentRequest(user2.address, amount1);
      await cryptoX.connect(user1).createPaymentRequest(user2.address, amount2);

      const requests = await cryptoX.getPaymentRequests(user1.address);

      expect(requests.length).to.equal(2);
      expect(requests[0].amount).to.equal(amount1);
      expect(requests[1].amount).to.equal(amount2);
    });

    it("Should return empty array for user with no payment requests", async function () {
      const requests = await cryptoX.getPaymentRequests(user1.address);
      expect(requests.length).to.equal(0);
    });

    it("Should emit PaymentCreated event", async function () {
      const amount = ethers.parseEther("5");

      await expect(
        cryptoX.connect(user1).createPaymentRequest(user2.address, amount)
      )
        .to.emit(cryptoX, "PaymentCreated")
        .withArgs(user1.address, user2.address, amount);
    });

    it("Should store correct timestamp in payment request", async function () {
      const amount = ethers.parseEther("5");
      const txTime = Math.floor(Date.now() / 1000);

      await cryptoX.connect(user1).createPaymentRequest(user2.address, amount);

      const requests = await cryptoX.getPaymentRequests(user1.address);
      const createdAt = Number(requests[0].createdAt);

      // Timestamp should be within 60 seconds of now
      expect(createdAt).to.be.closeTo(txTime, 60);
    });
  });

  // ─── Edge cases ───────────────────────────────────────────────────────────

  describe("Edge cases", function () {
    it("Should handle empty name on registration", async function () {
      await cryptoX.connect(owner).registerUser(
        "919999999999",
        "",
        user1.address,
        "encryptedkey123"
      );

      const [, name, , exists] = await cryptoX.getUser("919999999999");
      expect(exists).to.equal(true);
      expect(name).to.equal("");
    });

    it("Should handle zero amount payment request", async function () {
      await cryptoX.connect(user1).createPaymentRequest(user2.address, 0);
      const requests = await cryptoX.getPaymentRequests(user1.address);
      expect(requests[0].amount).to.equal(0);
    });

    it("Phone hash should be unique per phone number", async function () {
      // Same phone, different wallet should still fail (phone already registered)
      await cryptoX.connect(owner).registerUser(
        "919999999999",
        "Parth",
        user1.address,
        "key1"
      );

      await expect(
        cryptoX.connect(owner).registerUser(
          "919999999999",
          "Someone Else",
          user2.address,
          "key2"
        )
      ).to.be.revertedWith("User already exists");
    });
  });
});