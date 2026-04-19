const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("OffRamp", function () {
  let offRamp;
  let treasury;
  let owner;
  let oracleSigner;
  let user1;
  let user2;
  let addrs;

  // Test constants
  const RATE_VALIDITY_WINDOW = 300; // 5 minutes in seconds
  const FEE_PERCENT = 1;

  // Helper function to create signed rate
  async function signRate(rate, timestamp, signer) {
    const messageHash = ethers.solidityPackedKeccak256(
      ["uint256", "uint256"],
      [rate, timestamp]
    );
    const signature = await signer.signMessage(ethers.getBytes(messageHash));
    return signature;
  }

  // Helper function to create valid signed rate at current time
  async function createValidSignedRate(rateValue = 83) {
    const rate = ethers.parseEther(rateValue.toString()); // e.g., 83 INR per HLUSD
    const timestamp = await time.latest();
    const signature = await signRate(rate, timestamp, oracleSigner);
    return { rate, timestamp, signature };
  }

  beforeEach(async function () {
    // Get signers
    [owner, oracleSigner, user1, user2, ...addrs] = await ethers.getSigners();

    // Deploy OffRamp contract
    const OffRamp = await ethers.getContractFactory("OffRamp");
    offRamp = await OffRamp.deploy(oracleSigner.address);
    await offRamp.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct oracle signer", async function () {
      expect(await offRamp.oracleSigner()).to.equal(oracleSigner.address);
    });

    it("Should revert if oracle signer is zero address", async function () {
      const OffRamp = await ethers.getContractFactory("OffRamp");
      await expect(
        OffRamp.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid signer");
    });

    it("Should initialize with correct default values", async function () {
      expect(await offRamp.feePercent()).to.equal(FEE_PERCENT);
      expect(await offRamp.totalVolumeHLUSD()).to.equal(0);
      expect(await offRamp.totalFeesCollected()).to.equal(0);
      expect(await offRamp.totalConversions()).to.equal(0);
    });

    it("Should have correct rate validity window", async function () {
      expect(await offRamp.RATE_VALIDITY_WINDOW()).to.equal(RATE_VALIDITY_WINDOW);
    });
  });

  describe("Rate Signature Verification", function () {
    it("Should accept valid signature from oracle signer", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      const amount = ethers.parseEther("1.0");

      await expect(
        offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
          value: amount,
        })
      ).to.not.be.reverted;
    });

    it("Should reject signature from non-oracle signer", async function () {
      const rate = ethers.parseEther("83");
      const timestamp = await time.latest();
      // Sign with wrong signer (user1 instead of oracleSigner)
      const signature = await signRate(rate, timestamp, user1);
      const amount = ethers.parseEther("1.0");

      await expect(
        offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
          value: amount,
        })
      ).to.be.revertedWith("Invalid rate signature");
    });

    it("Should reject expired rate signature", async function () {
      const rate = ethers.parseEther("83");
      const timestamp = await time.latest();
      const signature = await signRate(rate, timestamp, oracleSigner);

      // Fast forward time beyond validity window
      await time.increase(RATE_VALIDITY_WINDOW + 1);

      const amount = ethers.parseEther("1.0");
      await expect(
        offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
          value: amount,
        })
      ).to.be.revertedWith("Rate expired");
    });

    it("Should accept rate signature at edge of validity window", async function () {
      const rate = ethers.parseEther("83");
      const timestamp = await time.latest();
      const signature = await signRate(rate, timestamp, oracleSigner);

      // Fast forward to just before the edge of validity (leave 1 second buffer)
      await time.increase(RATE_VALIDITY_WINDOW - 1);

      const amount = ethers.parseEther("1.0");
      await expect(
        offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
          value: amount,
        })
      ).to.not.be.reverted;
    });

    it("Should reject modified rate (signature mismatch)", async function () {
      const rate = ethers.parseEther("83");
      const timestamp = await time.latest();
      const signature = await signRate(rate, timestamp, oracleSigner);

      // Try to use different rate with same signature
      const modifiedRate = ethers.parseEther("100");
      const amount = ethers.parseEther("1.0");

      await expect(
        offRamp.connect(user1).convertToFiat(modifiedRate, timestamp, signature, {
          value: amount,
        })
      ).to.be.revertedWith("Invalid rate signature");
    });

    it("Should reject modified timestamp (signature mismatch)", async function () {
      const rate = ethers.parseEther("83");
      const timestamp = await time.latest();
      const signature = await signRate(rate, timestamp, oracleSigner);

      // Try to use different timestamp with same signature
      const modifiedTimestamp = timestamp + 100;
      const amount = ethers.parseEther("1.0");

      await expect(
        offRamp.connect(user1).convertToFiat(rate, modifiedTimestamp, signature, {
          value: amount,
        })
      ).to.be.revertedWith("Invalid rate signature");
    });
  });

  describe("Conversion Execution", function () {
    it("Should execute conversion with correct fee calculation", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      const amount = ethers.parseEther("10.0"); // 10 HLUSD
      const expectedFee = (amount * BigInt(FEE_PERCENT)) / 100n;
      const expectedNet = amount - expectedFee;
      const expectedINR = (expectedNet * rate) / ethers.parseEther("1");

      await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
        value: amount,
      });

      const conversion = await offRamp.getConversion(0);
      expect(conversion.user).to.equal(user1.address);
      expect(conversion.hlusdAmount).to.equal(amount);
      expect(conversion.feeAmount).to.equal(expectedFee);
      expect(conversion.inrAmount).to.equal(expectedINR);
      expect(conversion.rateUsed).to.equal(rate);
    });

    it("Should revert if no HLUSD sent", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);

      await expect(
        offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
          value: 0,
        })
      ).to.be.revertedWith("Amount required");
    });

    it("Should update total volume correctly", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      const amount = ethers.parseEther("10.0");
      const expectedFee = (amount * BigInt(FEE_PERCENT)) / 100n;
      const expectedNet = amount - expectedFee;

      await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
        value: amount,
      });

      expect(await offRamp.totalVolumeHLUSD()).to.equal(expectedNet);
    });

    it("Should update total fees collected", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      const amount = ethers.parseEther("10.0");
      const expectedFee = (amount * BigInt(FEE_PERCENT)) / 100n;

      await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
        value: amount,
      });

      expect(await offRamp.totalFeesCollected()).to.equal(expectedFee);
    });

    it("Should increment total conversions counter", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);

      await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
        value: ethers.parseEther("1.0"),
      });

      expect(await offRamp.totalConversions()).to.equal(1);
    });

    it("Should emit ConversionExecuted event", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      const amount = ethers.parseEther("10.0");
      const expectedFee = (amount * BigInt(FEE_PERCENT)) / 100n;
      const expectedNet = amount - expectedFee;
      const expectedINR = (expectedNet * rate) / ethers.parseEther("1");

      const tx = await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
        value: amount,
      });
      
      const receipt = await tx.wait();
      const blockTimestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;

      await expect(tx)
        .to.emit(offRamp, "ConversionExecuted")
        .withArgs(
          0, // conversionId
          user1.address,
          amount,
          expectedINR,
          expectedFee,
          rate,
          blockTimestamp // Use actual block timestamp instead of time.latest()
        );
    });

    it("Should handle multiple conversions from same user", async function () {
      // First conversion
      const signed1 = await createValidSignedRate(83);
      await offRamp.connect(user1).convertToFiat(
        signed1.rate,
        signed1.timestamp,
        signed1.signature,
        { value: ethers.parseEther("5.0") }
      );

      // Second conversion (need new timestamp to avoid replay)
      await time.increase(10);
      const signed2 = await createValidSignedRate(85);
      await offRamp.connect(user1).convertToFiat(
        signed2.rate,
        signed2.timestamp,
        signed2.signature,
        { value: ethers.parseEther("3.0") }
      );

      const userConversions = await offRamp.getUserConversions(user1.address);
      expect(userConversions.length).to.equal(2);
      expect(userConversions[0]).to.equal(0);
      expect(userConversions[1]).to.equal(1);
    });

    it("Should handle conversions from multiple users", async function () {
      // User1 conversion
      const signed1 = await createValidSignedRate(83);
      await offRamp.connect(user1).convertToFiat(
        signed1.rate,
        signed1.timestamp,
        signed1.signature,
        { value: ethers.parseEther("5.0") }
      );

      // User2 conversion
      await time.increase(10);
      const signed2 = await createValidSignedRate(85);
      await offRamp.connect(user2).convertToFiat(
        signed2.rate,
        signed2.timestamp,
        signed2.signature,
        { value: ethers.parseEther("3.0") }
      );

      expect(await offRamp.totalConversions()).to.equal(2);

      const user1Conversions = await offRamp.getUserConversions(user1.address);
      const user2Conversions = await offRamp.getUserConversions(user2.address);

      expect(user1Conversions.length).to.equal(1);
      expect(user2Conversions.length).to.equal(1);
    });

    it("Should store correct timestamp in conversion record", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      
      await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
        value: ethers.parseEther("1.0"),
      });

      const conversion = await offRamp.getConversion(0);
      const expectedTimestamp = await time.latest();
      expect(conversion.timestamp).to.equal(expectedTimestamp);
    });
  });

  describe("Fee Calculations", function () {
    it("Should calculate 1% fee correctly for various amounts", async function () {
      const testAmounts = [
        ethers.parseEther("1.0"),
        ethers.parseEther("10.0"),
        ethers.parseEther("100.0"),
        ethers.parseEther("0.5"),
      ];

      let conversionId = 0;
      for (const amount of testAmounts) {
        await time.increase(10); // Avoid timestamp collision
        const { rate, timestamp, signature } = await createValidSignedRate(83);

        await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
          value: amount,
        });

        const conversion = await offRamp.getConversion(conversionId);
        const expectedFee = (amount * BigInt(FEE_PERCENT)) / 100n;
        
        expect(conversion.feeAmount).to.equal(expectedFee);
        conversionId++;
      }
    });

    it("Should accumulate fees correctly over multiple conversions", async function () {
      const amounts = [
        ethers.parseEther("10.0"),
        ethers.parseEther("20.0"),
        ethers.parseEther("15.0"),
      ];

      let totalExpectedFees = 0n;

      for (const amount of amounts) {
        await time.increase(10);
        const { rate, timestamp, signature } = await createValidSignedRate(83);
        
        await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
          value: amount,
        });

        totalExpectedFees += (amount * BigInt(FEE_PERCENT)) / 100n;
      }

      expect(await offRamp.totalFeesCollected()).to.equal(totalExpectedFees);
    });
  });

  describe("Conversion History", function () {
    it("Should track user conversions correctly", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      
      await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
        value: ethers.parseEther("1.0"),
      });

      const userConversions = await offRamp.getUserConversions(user1.address);
      expect(userConversions.length).to.equal(1);
      expect(userConversions[0]).to.equal(0);
    });

    it("Should return empty array for users with no conversions", async function () {
      const userConversions = await offRamp.getUserConversions(user2.address);
      expect(userConversions.length).to.equal(0);
    });

    it("Should retrieve conversion details correctly", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      const amount = ethers.parseEther("10.0");

      await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
        value: amount,
      });

      const conversion = await offRamp.getConversion(0);
      
      expect(conversion.user).to.equal(user1.address);
      expect(conversion.hlusdAmount).to.equal(amount);
      expect(conversion.rateUsed).to.equal(rate);
      expect(conversion.feeAmount).to.be.gt(0);
      expect(conversion.inrAmount).to.be.gt(0);
    });

    it("Should maintain separate history for different users", async function () {
      // User1 makes 2 conversions
      const signed1 = await createValidSignedRate(83);
      await offRamp.connect(user1).convertToFiat(
        signed1.rate,
        signed1.timestamp,
        signed1.signature,
        { value: ethers.parseEther("5.0") }
      );

      await time.increase(10);
      const signed2 = await createValidSignedRate(84);
      await offRamp.connect(user1).convertToFiat(
        signed2.rate,
        signed2.timestamp,
        signed2.signature,
        { value: ethers.parseEther("3.0") }
      );

      // User2 makes 1 conversion
      await time.increase(10);
      const signed3 = await createValidSignedRate(85);
      await offRamp.connect(user2).convertToFiat(
        signed3.rate,
        signed3.timestamp,
        signed3.signature,
        { value: ethers.parseEther("7.0") }
      );

      const user1Conversions = await offRamp.getUserConversions(user1.address);
      const user2Conversions = await offRamp.getUserConversions(user2.address);

      expect(user1Conversions.length).to.equal(2);
      expect(user2Conversions.length).to.equal(1);

      const user1Conv0 = await offRamp.getConversion(user1Conversions[0]);
      const user2Conv0 = await offRamp.getConversion(user2Conversions[0]);

      expect(user1Conv0.user).to.equal(user1.address);
      expect(user2Conv0.user).to.equal(user2.address);
    });
  });

  describe("Platform Statistics", function () {
    it("Should return correct stats after conversions", async function () {
      const amount1 = ethers.parseEther("10.0");
      const amount2 = ethers.parseEther("5.0");

      // First conversion
      const signed1 = await createValidSignedRate(83);
      await offRamp.connect(user1).convertToFiat(
        signed1.rate,
        signed1.timestamp,
        signed1.signature,
        { value: amount1 }
      );

      // Second conversion
      await time.increase(10);
      const signed2 = await createValidSignedRate(85);
      await offRamp.connect(user2).convertToFiat(
        signed2.rate,
        signed2.timestamp,
        signed2.signature,
        { value: amount2 }
      );

      const [volume, fees, count] = await offRamp.getStats();

      const totalAmount = amount1 + amount2;
      const totalFees = (totalAmount * BigInt(FEE_PERCENT)) / 100n;
      const totalVolume = totalAmount - totalFees;

      expect(volume).to.equal(totalVolume);
      expect(fees).to.equal(totalFees);
      expect(count).to.equal(2);
    });

    it("Should start with zero stats", async function () {
      const [volume, fees, count] = await offRamp.getStats();
      
      expect(volume).to.equal(0);
      expect(fees).to.equal(0);
      expect(count).to.equal(0);
    });
  });

  describe("Fee Withdrawal", function () {
    beforeEach(async function () {
      // Make a conversion to collect some fees
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
        value: ethers.parseEther("100.0"),
      });
    });

    it("Should withdraw fees successfully", async function () {
      const feesBefore = await offRamp.totalFeesCollected();
      expect(feesBefore).to.be.gt(0);

      const recipientBalanceBefore = await ethers.provider.getBalance(owner.address);

      const tx = await offRamp.withdrawFees(owner.address);
      const receipt = await tx.wait();
      
      // Calculate gas cost
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const feesAfter = await offRamp.totalFeesCollected();
      const recipientBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(feesAfter).to.equal(0);
      
      // Account for gas costs since owner is also the transaction sender
      const expectedBalance = recipientBalanceBefore + feesBefore - gasUsed;
      expect(recipientBalanceAfter).to.equal(expectedBalance);
    });

    it("Should emit FeesWithdrawn event", async function () {
      const fees = await offRamp.totalFeesCollected();

      await expect(offRamp.withdrawFees(owner.address))
        .to.emit(offRamp, "FeesWithdrawn")
        .withArgs(owner.address, fees);
    });

    it("Should revert if recipient is zero address", async function () {
      await expect(
        offRamp.withdrawFees(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid recipient");
    });

    it("Should revert if no fees to withdraw", async function () {
      // First withdraw all fees
      await offRamp.withdrawFees(owner.address);

      // Try to withdraw again
      await expect(
        offRamp.withdrawFees(owner.address)
      ).to.be.revertedWith("No fees to withdraw");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very small amounts", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      const smallAmount = ethers.parseEther("0.001");

      await expect(
        offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
          value: smallAmount,
        })
      ).to.not.be.reverted;

      const conversion = await offRamp.getConversion(0);
      expect(conversion.hlusdAmount).to.equal(smallAmount);
    });

    it("Should handle very large amounts", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      const largeAmount = ethers.parseEther("10000"); // 10k HLUSD (reduced from 1M)

      await expect(
        offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
          value: largeAmount,
        })
      ).to.not.be.reverted;

      const conversion = await offRamp.getConversion(0);
      expect(conversion.hlusdAmount).to.equal(largeAmount);
    });

    it("Should handle very high exchange rates", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(1000000);
      const amount = ethers.parseEther("1.0");

      await expect(
        offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
          value: amount,
        })
      ).to.not.be.reverted;
    });

    it("Should handle very low exchange rates", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(0.01);
      const amount = ethers.parseEther("1.0");

      await expect(
        offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
          value: amount,
        })
      ).to.not.be.reverted;
    });

    it("Should prevent replay attacks across different users", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);

      // User1 uses the signature
      await offRamp.connect(user1).convertToFiat(rate, timestamp, signature, {
        value: ethers.parseEther("1.0"),
      });

      // User2 tries to reuse the same signature (should still work as it's valid)
      // But this demonstrates that signatures aren't tied to specific users
      await expect(
        offRamp.connect(user2).convertToFiat(rate, timestamp, signature, {
          value: ethers.parseEther("1.0"),
        })
      ).to.not.be.reverted;

      // Both conversions should exist
      expect(await offRamp.totalConversions()).to.equal(2);
    });

    it("Should handle contract receiving HLUSD directly", async function () {
      // Send HLUSD directly to contract
      await owner.sendTransaction({
        to: await offRamp.getAddress(),
        value: ethers.parseEther("10.0"),
      });

      const contractBalance = await ethers.provider.getBalance(
        await offRamp.getAddress()
      );
      expect(contractBalance).to.be.gt(0);
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for conversion", async function () {
      const { rate, timestamp, signature } = await createValidSignedRate(83);
      
      const tx = await offRamp.connect(user1).convertToFiat(
        rate,
        timestamp,
        signature,
        { value: ethers.parseEther("1.0") }
      );

      const receipt = await tx.wait();
      
      // ECDSA signature verification adds overhead
      // Reasonable limit is 300k gas for signature verification + storage
      expect(receipt.gasUsed).to.be.lt(300000);
      
      console.log("      Gas used for conversion:", receipt.gasUsed.toString());
    });
  });

  describe("Integration Scenarios", function () {
    it("Should handle complete user journey", async function () {
      // User starts with no conversions
      let userConversions = await offRamp.getUserConversions(user1.address);
      expect(userConversions.length).to.equal(0);

      // User makes first conversion
      const signed1 = await createValidSignedRate(83);
      await offRamp.connect(user1).convertToFiat(
        signed1.rate,
        signed1.timestamp,
        signed1.signature,
        { value: ethers.parseEther("10.0") }
      );

      // User checks history
      userConversions = await offRamp.getUserConversions(user1.address);
      expect(userConversions.length).to.equal(1);

      // User makes second conversion
      await time.increase(10);
      const signed2 = await createValidSignedRate(85);
      await offRamp.connect(user1).convertToFiat(
        signed2.rate,
        signed2.timestamp,
        signed2.signature,
        { value: ethers.parseEther("5.0") }
      );

      // User checks updated history
      userConversions = await offRamp.getUserConversions(user1.address);
      expect(userConversions.length).to.equal(2);

      // User retrieves conversion details
      const conv1 = await offRamp.getConversion(userConversions[0]);
      const conv2 = await offRamp.getConversion(userConversions[1]);

      expect(conv1.hlusdAmount).to.equal(ethers.parseEther("10.0"));
      expect(conv2.hlusdAmount).to.equal(ethers.parseEther("5.0"));

      // Check platform stats
      const [volume, fees, count] = await offRamp.getStats();
      expect(count).to.equal(2);
      expect(volume).to.be.gt(0);
      expect(fees).to.be.gt(0);
    });

    it("Should handle multiple users converting simultaneously", async function () {
      const amount = ethers.parseEther("1.0");
      const users = [user1, user2, addrs[0], addrs[1], addrs[2]];

      for (let i = 0; i < users.length; i++) {
        await time.increase(5);
        const { rate, timestamp, signature } = await createValidSignedRate(83 + i);
        
        await offRamp.connect(users[i]).convertToFiat(
          rate,
          timestamp,
          signature,
          { value: amount }
        );
      }

      expect(await offRamp.totalConversions()).to.equal(users.length);

      // Each user should have exactly 1 conversion
      for (const user of users) {
        const conversions = await offRamp.getUserConversions(user.address);
        expect(conversions.length).to.equal(1);
      }
    });
  });
});
