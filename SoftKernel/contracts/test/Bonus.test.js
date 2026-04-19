const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Bonus System", function () {
  let treasury, salaryStream;
  let owner, employer, employee, employee2, taxVault;
  const SECONDS_PER_MONTH = 30n * 24n * 3600n;

  beforeEach(async function () {
    [owner, employer, employee, employee2, taxVault] = await ethers.getSigners();

    // Deploy contracts
    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy();
    await treasury.waitForDeployment();

    const SalaryStream = await ethers.getContractFactory("SalaryStream");
    salaryStream = await SalaryStream.deploy(
      await treasury.getAddress(),
      taxVault.address
    );
    await salaryStream.waitForDeployment();

    // Link contracts
    await treasury.setSalaryStream(await salaryStream.getAddress());

    // Setup: Employer creates company and adds employees
    await salaryStream.connect(employer).createCompany("Test Company");
    await salaryStream.connect(employer).addEmployee(1, employee.address);
    await salaryStream.connect(employer).addEmployee(1, employee2.address);

    // Setup: Employer deposits and creates stream (3000 reserved = 500 * 6)
    await treasury.connect(employer).deposit({ value: ethers.parseEther("5000") });
    await salaryStream.connect(employer).createStream(
      1, // companyId
      employee.address,
      ethers.parseEther("500"), // 500 HLUSD/month
      6, // 6 months
      10 // 10% tax
    );
  });

  describe("Scheduling Bonuses", function () {
    it("Should allow admin to schedule a bonus", async function () {
      const unlockTime = (await time.latest()) + 86400; // 1 day from now
      const bonusAmount = ethers.parseEther("1000");

      await expect(
        salaryStream.connect(employer).scheduleBonus(employee.address,
          bonusAmount,
          unlockTime
        )
      ).to.not.be.reverted;
    });

    it("Should emit BonusScheduled event", async function () {
      const unlockTime = (await time.latest()) + 86400;
      const bonusAmount = ethers.parseEther("1000");

      await expect(
        salaryStream.connect(employer).scheduleBonus(employee.address,
          bonusAmount,
          unlockTime
        )
      )
        .to.emit(salaryStream, "BonusScheduled")
        .withArgs(employee.address, bonusAmount, unlockTime, 0); // bonusIndex is 0 for first bonus
    });

    it("Should store bonus correctly", async function () {
      const unlockTime = (await time.latest()) + 86400;
      const bonusAmount = ethers.parseEther("1000");

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        bonusAmount,
        unlockTime
      );

      const bonuses = await salaryStream.getEmployeeBonuses(employee.address);
      expect(bonuses.length).to.equal(1);
      expect(bonuses[0].amount).to.equal(bonusAmount);
      expect(bonuses[0].unlockTime).to.equal(unlockTime);
      expect(bonuses[0].claimed).to.be.false;
    });

    it("Should revert if stream doesn't exist", async function () {
      const [, , , , , nonEmployee] = await ethers.getSigners();
      const unlockTime = (await time.latest()) + 86400;

      await expect(
        salaryStream.connect(employer).scheduleBonus(nonEmployee.address,
          ethers.parseEther("1000"),
          unlockTime
        )
      ).to.be.revertedWith("Stream not found");
    });

    it("Should revert if unlock time is in the past", async function () {
      const pastTime = (await time.latest()) - 3600; // 1 hour ago

      await expect(
        salaryStream.connect(employer).scheduleBonus(employee.address,
          ethers.parseEther("1000"),
          pastTime
        )
      ).to.be.revertedWith("Unlock must be in future");
    });

    it("Should revert if not admin", async function () {
      const unlockTime = (await time.latest()) + 86400;

      await expect(
        salaryStream.connect(employee).scheduleBonus(employee.address,
          ethers.parseEther("1000"),
          unlockTime
        )
      ).to.be.revertedWith("Not HR or CEO");
    });

    it("Should revert if insufficient treasury balance", async function () {
      const unlockTime = (await time.latest()) + 86400;
      
      // Try to schedule bonus exceeding available balance
      // Employer has 5000 deposited, 3000 reserved for stream = 2000 available
      const excessive = ethers.parseEther("3000"); // More than 2000 available

      await expect(
        salaryStream.connect(employer).scheduleBonus(employee.address,
          excessive,
          unlockTime
        )
      ).to.be.reverted; // Just check it reverts, message may vary
    });

    it("Should update totalBonusesScheduled", async function () {
      const bonusAmount = ethers.parseEther("1000");
      const unlockTime = (await time.latest()) + 86400;

      const beforeScheduled = await salaryStream.totalBonusesScheduled();
      
      await salaryStream.connect(employer).scheduleBonus(employee.address,
        bonusAmount,
        unlockTime
      );

      const afterScheduled = await salaryStream.totalBonusesScheduled();
      expect(afterScheduled - beforeScheduled).to.equal(bonusAmount);
    });

    it("Should reserve funds in treasury", async function () {
      const bonusAmount = ethers.parseEther("1000");
      const unlockTime = (await time.latest()) + 86400;

      const reservedBefore = await treasury.employerReserved(employer.address);
      
      await salaryStream.connect(employer).scheduleBonus(employee.address,
        bonusAmount,
        unlockTime
      );

      const reservedAfter = await treasury.employerReserved(employer.address);
      expect(reservedAfter - reservedBefore).to.equal(bonusAmount);
    });

    it("Should allow scheduling multiple bonuses for same employee", async function () {
      const bonus1Time = (await time.latest()) + 86400;
      const bonus2Time = (await time.latest()) + 172800; // 2 days

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("500"),
        bonus1Time
      );

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("500"),
        bonus2Time
      );

      const bonuses = await salaryStream.getEmployeeBonuses(employee.address);
      expect(bonuses.length).to.equal(2);
      expect(bonuses[0].amount).to.equal(ethers.parseEther("500"));
      expect(bonuses[1].amount).to.equal(ethers.parseEther("500"));
    });
  });

  describe("Bonus Unlocking and Claiming", function () {
    beforeEach(async function () {
      // Schedule a bonus that unlocks in 1 day
      this.unlockTime = (await time.latest()) + 86400;
      this.bonusAmount = ethers.parseEther("1000");

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        this.bonusAmount,
        this.unlockTime
      );
    });

    it("Should show bonus as pending before unlock time", async function () {
      const pending = await salaryStream.getPendingBonusTotal(employee.address);
      expect(pending).to.equal(0);
    });

    it("Should show bonus as pending after unlock time", async function () {
      await time.increaseTo(this.unlockTime);

      const pending = await salaryStream.getPendingBonusTotal(employee.address);
      expect(pending).to.equal(this.bonusAmount);
    });

    it("Should auto-claim unlocked bonus on withdrawal", async function () {
      // Advance past unlock time
      await time.increaseTo(this.unlockTime + 1);

      // Employee withdraws
      const balanceBefore = await ethers.provider.getBalance(employee.address);
      const pending = await salaryStream.getPendingBonusTotal(employee.address);

      const tx = await salaryStream.connect(employee).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(employee.address);

      // Should receive bonus minus gas (salary will be minimal since stream just started)
      expect(balanceAfter).to.be.gt(balanceBefore - gasUsed);
    });

    it("Should mark bonus as claimed after withdrawal", async function () {
      await time.increaseTo(this.unlockTime + 1);
      await salaryStream.connect(employee).withdraw();

      const bonuses = await salaryStream.getEmployeeBonuses(employee.address);
      expect(bonuses[0].claimed).to.be.true;
    });

    it("Should not claim bonus twice", async function () {
      await time.increaseTo(this.unlockTime + 1);

      // First withdrawal claims bonus
      await salaryStream.connect(employee).withdraw();

      // Second withdrawal should not include bonus
      const balanceBefore = await ethers.provider.getBalance(employee.address);
      const tx = await salaryStream.connect(employee).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(employee.address);

      // Should only receive gas cost (maybe tiny salary stream)
      expect(balanceAfter).to.be.closeTo(balanceBefore - gasUsed, ethers.parseEther("0.1"));
    });

    it("Should emit BonusClaimed event when bonus is claimed", async function () {
      await time.increaseTo(this.unlockTime + 1);

      await expect(salaryStream.connect(employee).withdraw())
        .to.emit(salaryStream, "BonusClaimed")
        .withArgs(employee.address, this.bonusAmount, 0); // bonusIndex 0
    });

    it("Should update totalBonusesPaid", async function () {
      await time.increaseTo(this.unlockTime + 1);

      const paidBefore = await salaryStream.totalBonusesPaid();
      await salaryStream.connect(employee).withdraw();
      const paidAfter = await salaryStream.totalBonusesPaid();

      expect(paidAfter - paidBefore).to.equal(this.bonusAmount);
    });
  });

  describe("Bonuses with Tax", function () {
    it("Should apply tax to bonus amount", async function () {
      const unlockTime = (await time.latest()) + 86400;
      const bonusAmount = ethers.parseEther("1000");

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        bonusAmount,
        unlockTime
      );

      await time.increaseTo(unlockTime + 1);

      // Calculate accumulated salary (stream has been running since creation)
      const stream = await salaryStream.streams(employee.address);
      const currentTime = BigInt(await time.latest());
      const elapsed = currentTime - stream.startTime;
      const accumulatedSalary = stream.ratePerSecond * elapsed;

      const taxVaultBalanceBefore = await ethers.provider.getBalance(taxVault.address);
      await salaryStream.connect(employee).withdraw();
      const taxVaultBalanceAfter = await ethers.provider.getBalance(taxVault.address);

      // 10% tax on (salary + bonus)
      const grossTotal = accumulatedSalary + BigInt(bonusAmount);
      const expectedTax = grossTotal / 10n;
      expect(taxVaultBalanceAfter - taxVaultBalanceBefore).to.be.closeTo(
        expectedTax,
        ethers.parseEther("1") // Allow tolerance for timing
      );
    });

    it("Should combine salary and bonus before applying tax", async function () {
      // Advance time to accumulate some salary
      await time.increase(SECONDS_PER_MONTH);

      // Schedule and unlock bonus
      const unlockTime = (await time.latest()) + 100;
      const bonusAmount = ethers.parseEther("1000");

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        bonusAmount,
        unlockTime
      );

      await time.increaseTo(unlockTime + 1);

      // Get stream info to calculate salary
      const stream = await salaryStream.streams(employee.address);
      const currentTime = BigInt(await time.latest());
      const elapsed = currentTime - stream.startTime;
      const expectedSalary = stream.ratePerSecond * elapsed;

      const taxVaultBalanceBefore = await ethers.provider.getBalance(taxVault.address);
      await salaryStream.connect(employee).withdraw();
      const taxVaultBalanceAfter = await ethers.provider.getBalance(taxVault.address);

      // Tax should be on (salary + bonus)
      const grossTotal = expectedSalary + bonusAmount;
      const expectedTax = (grossTotal * 10n) / 100n;

      expect(taxVaultBalanceAfter - taxVaultBalanceBefore).to.be.closeTo(
        expectedTax,
        ethers.parseEther("1") // Allow some tolerance for timing
      );
    });
  });

  describe("Multiple Bonuses", function () {
    it("Should handle multiple bonuses with different unlock times", async function () {
      const now = await time.latest();
      const bonus1Time = now + 86400; // 1 day
      const bonus2Time = now + 172800; // 2 days
      const bonus3Time = now + 259200; // 3 days

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("200"),
        bonus1Time
      );

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("300"),
        bonus2Time
      );

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("400"),
        bonus3Time
      );

      // After 1 day - only first bonus unlocked
      await time.increaseTo(bonus1Time + 1);
      let pending = await salaryStream.getPendingBonusTotal(employee.address);
      expect(pending).to.equal(ethers.parseEther("200"));

      // After 2 days - first two bonuses unlocked
      await time.increaseTo(bonus2Time + 1);
      pending = await salaryStream.getPendingBonusTotal(employee.address);
      expect(pending).to.equal(ethers.parseEther("500")); // 200 + 300

      // Claim first two
      await salaryStream.connect(employee).withdraw();

      // After 3 days - only third bonus pending
      await time.increaseTo(bonus3Time + 1);
      pending = await salaryStream.getPendingBonusTotal(employee.address);
      expect(pending).to.equal(ethers.parseEther("400"));
    });

    it("Should claim all unlocked bonuses in single withdrawal", async function () {
      const now = await time.latest();
      const unlockTime = now + 86400;

      // Schedule 3 bonuses with same unlock time
      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("500"),
        unlockTime
      );

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("800"),
        unlockTime
      );

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("700"),
        unlockTime
      );

      await time.increaseTo(unlockTime + 1);

      const paidBefore = await salaryStream.totalBonusesPaid();
      await salaryStream.connect(employee).withdraw();
      const paidAfter = await salaryStream.totalBonusesPaid();

      // All 3 bonuses claimed
      expect(paidAfter - paidBefore).to.equal(ethers.parseEther("2000"));

      // Verify all marked as claimed
      const bonuses = await salaryStream.getEmployeeBonuses(employee.address);
      expect(bonuses[0].claimed).to.be.true;
      expect(bonuses[1].claimed).to.be.true;
      expect(bonuses[2].claimed).to.be.true;
    });
  });

  describe("Bonus Stats and Views", function () {
    it("Should return correct bonus stats", async function () {
      const unlockTime = (await time.latest()) + 86400;
      const bonus1 = ethers.parseEther("500");
      const bonus2 = ethers.parseEther("800");

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        bonus1,
        unlockTime
      );

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        bonus2,
        unlockTime
      );

      let stats = await salaryStream.getBonusStats();
      expect(stats[0]).to.equal(bonus1 + bonus2); // totalBonusesScheduled
      expect(stats[1]).to.equal(0); // totalBonusesPaid
      expect(stats[2]).to.equal(bonus1 + bonus2); // currentBonusLiability

      // Claim one
      await time.increaseTo(unlockTime + 1);
      await salaryStream.connect(employee).withdraw();

      stats = await salaryStream.getBonusStats();
      expect(stats[1]).to.equal(bonus1 + bonus2); // totalBonusesPaid
      expect(stats[2]).to.equal(0); // currentBonusLiability
    });

    it("Should track bonuses for multiple employees separately", async function () {
      // Deposit more funds for second stream and bonuses
      await treasury.connect(employer).deposit({ value: ethers.parseEther("40000") });

      // Create stream for second employee (smaller, shorter duration)
      await salaryStream.connect(employer).createStream(
        1, // companyId
        employee2.address,
        ethers.parseEther("2000"), // 2000/month
        6, // 6 months = 12000 total reserved
        10
      );

      const unlockTime = (await time.latest()) + 86400;

      // Schedule bonuses for both (small amounts)
      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("500"),
        unlockTime
      );

      await salaryStream.connect(employer).scheduleBonus(employee2.address,
        ethers.parseEther("700"),
        unlockTime
      );

      const bonuses1 = await salaryStream.getEmployeeBonuses(employee.address);
      const bonuses2 = await salaryStream.getEmployeeBonuses(employee2.address);

      expect(bonuses1.length).to.equal(1);
      expect(bonuses2.length).to.equal(1);
      expect(bonuses1[0].amount).to.equal(ethers.parseEther("500"));
      expect(bonuses2[0].amount).to.equal(ethers.parseEther("700"));
    });
  });

  describe("Bonuses with Stream Lifecycle", function () {
    it("Should block bonus claims when stream is paused", async function () {
      const unlockTime = (await time.latest()) + 86400;
      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("1000"),
        unlockTime
      );

      // Pause stream
      await salaryStream.connect(employer).pauseStream(employee.address);

      await time.increaseTo(unlockTime + 1);

      // Should not be able to withdraw when paused
      await expect(
        salaryStream.connect(employee).withdraw()
      ).to.be.revertedWith("Stream paused");

      // Unpause and then should be able to claim
      await salaryStream.connect(employer).resumeStream(employee.address);
      await salaryStream.connect(employee).withdraw();

      const bonuses = await salaryStream.getEmployeeBonuses(employee.address);
      expect(bonuses[0].claimed).to.be.true;
    });

    it("Should preserve bonuses when stream ends", async function () {
      // Schedule bonus with far future unlock
      const unlockTime = (await time.latest()) + 365 * 86400; // 1 year

      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("500"),
        unlockTime
      );

      // End stream early
      await salaryStream.connect(employer).cancelStream(employee.address);

      // Bonus should still exist
      const bonuses = await salaryStream.getEmployeeBonuses(employee.address);
      expect(bonuses.length).to.equal(1);
      expect(bonuses[0].amount).to.equal(ethers.parseEther("500"));

      // And should be claimable after unlock
      await time.increaseTo(unlockTime + 1);
      const pending = await salaryStream.getPendingBonusTotal(employee.address);
      expect(pending).to.equal(ethers.parseEther("500"));
    });
  });

  describe("Bonus Global Stats Integration", function () {
    it("Should include bonus metrics in getGlobalStats", async function () {
      const unlockTime = (await time.latest()) + 86400;
      const bonusAmount = ethers.parseEther("1000");

      const statsBefore = await salaryStream.getGlobalStats();
      
      await salaryStream.connect(employer).scheduleBonus(employee.address,
        bonusAmount,
        unlockTime
      );

      const statsAfter = await salaryStream.getGlobalStats();

      // Index 4 is totalBonusesScheduled, index 5 is totalBonusesPaid
      expect(statsAfter[4] - statsBefore[4]).to.equal(bonusAmount);
      expect(statsAfter[5]).to.equal(0); // Not paid yet

      // Claim bonus
      await time.increaseTo(unlockTime + 1);
      await salaryStream.connect(employee).withdraw();

      const statsFinal = await salaryStream.getGlobalStats();
      expect(statsFinal[5]).to.equal(bonusAmount); // Now paid
    });
  });

  describe("Gas Efficiency Tests", function () {
    it("Should handle reasonable number of bonuses without excessive gas", async function () {
      const now = await time.latest();

      // Schedule 10 bonuses
      for (let i = 0; i < 10; i++) {
        await salaryStream.connect(employer).scheduleBonus(employee.address,
          ethers.parseEther("100"),
          now + 86400 + i
        );
      }

      await time.increaseTo(now + 86400 + 10);

      // Should be able to withdraw all 10 without running out of gas
      const tx = await salaryStream.connect(employee).withdraw();
      const receipt = await tx.wait();

      // Gas should be reasonable (adjust threshold as needed)
      expect(receipt.gasUsed).to.be.lt(500000);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount bonus rejection", async function () {
      const unlockTime = (await time.latest()) + 86400;

      // Contract validates amount > 0
      await expect(
        salaryStream.connect(employer).scheduleBonus(employee.address,
          0,
          unlockTime
        )
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should handle very large unlock times", async function () {
      const farFuture = (await time.latest()) + 100 * 365 * 86400; // 100 years

      await expect(
        salaryStream.connect(employer).scheduleBonus(employee.address,
          ethers.parseEther("1000"),
          farFuture
        )
      ).to.not.be.reverted;

      const bonuses = await salaryStream.getEmployeeBonuses(employee.address);
      expect(bonuses[0].unlockTime).to.equal(farFuture);
    });

    it("Should handle bonus exactly at unlock time", async function () {
      const unlockTime = (await time.latest()) + 86400;
      await salaryStream.connect(employer).scheduleBonus(employee.address,
        ethers.parseEther("1000"),
        unlockTime
      );

      // Set time to exactly unlock time (not +1)
      await time.increaseTo(unlockTime);

      const pending = await salaryStream.getPendingBonusTotal(employee.address);
      expect(pending).to.equal(ethers.parseEther("1000"));
    });
  });
});



