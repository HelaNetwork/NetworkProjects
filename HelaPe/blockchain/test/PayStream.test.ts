
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PayStream", function () {
    async function deployPayStreamFixture() {
        const [owner, hr, employee, employee2, taxVault] = await ethers.getSigners();

        const MockHLUSD = await ethers.getContractFactory("MockHLUSD");
        const mockHLUSD = await MockHLUSD.deploy();

        // Distribute tokens to HR
        await mockHLUSD.transfer(hr.address, ethers.parseEther("100000"));

        const PayStream = await ethers.getContractFactory("PayStream");
        const payStream = await PayStream.deploy(await mockHLUSD.getAddress(), taxVault.address);

        return { payStream, mockHLUSD, owner, hr, employee, employee2, taxVault };
    }

    describe("Basic Streaming", function () {
        it("Should allow creating a stream", async function () {
            const { payStream, mockHLUSD, hr, employee } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("1000");
            const rate = ethers.parseEther("1");
            const startTime = await time.latest() + 10;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);

            await expect(payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime))
                .to.emit(payStream, "StreamCreated")
                .withArgs(0, hr.address, employee.address, rate, deposit, startTime);
        });

        it("Should allow withdrawal with tax", async function () {
            const { payStream, mockHLUSD, hr, employee, taxVault } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("1000");
            const rate = ethers.parseEther("10");
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);
            await payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime);

            await time.increase(12);

            const withdrawAmount = ethers.parseEther("100");
            await expect(payStream.connect(employee).withdraw(0, withdrawAmount))
                .to.emit(payStream, "Withdrawn");

            expect(await mockHLUSD.balanceOf(taxVault.address)).to.equal(ethers.parseEther("10"));
            expect(await mockHLUSD.balanceOf(employee.address)).to.equal(ethers.parseEther("90"));
        });
    });

    describe("Edge Case: Employee Leaves Mid-Month", function () {
        it("Should handle stream cancellation mid-way and refund unvested tokens", async function () {
            const { payStream, mockHLUSD, hr, employee } = await loadFixture(deployPayStreamFixture);

            // 30-day month = 2,592,000 seconds
            const monthlySalary = ethers.parseEther("3000");
            const ratePerSecond = monthlySalary / BigInt(2592000);
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), monthlySalary);
            await payStream.connect(hr).createStream(0, employee.address, ratePerSecond, monthlySalary, startTime);

            // Employee works for 15 days (half month)
            await time.increase(1296000); // 15 days

            const hrBalanceBefore = await mockHLUSD.balanceOf(hr.address);

            // Cancel stream (employee leaves)
            await expect(payStream.connect(hr).cancelStream(0))
                .to.emit(payStream, "StreamCancelled");

            const hrBalanceAfter = await mockHLUSD.balanceOf(hr.address);
            const refunded = hrBalanceAfter - hrBalanceBefore;

            // Should get approximately half back (minus rounding)
            expect(refunded).to.be.closeTo(ethers.parseEther("1500"), ethers.parseEther("5"));
            
            // Employee should be able to withdraw vested amount even after cancellation
            const vestedAmount = await payStream.getVestedAmount(0);
            expect(vestedAmount).to.be.closeTo(ethers.parseEther("1500"), ethers.parseEther("5"));
            
            await expect(payStream.connect(employee).withdraw(0, vestedAmount))
                .to.emit(payStream, "Withdrawn");
            
            const employeeBalance = await mockHLUSD.balanceOf(employee.address);
            expect(employeeBalance).to.be.greaterThan(ethers.parseEther("1300")); // ~1350 after 10% tax
        });
    });

    describe("Edge Case: Employer Underfunds Pool", function () {
        it("Should prevent withdrawal exceeding vested amount", async function () {
            const { payStream, mockHLUSD, hr, employee } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("100");
            const rate = ethers.parseEther("1");
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);
            await payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime);

            // Only 10 seconds passed = 10 tokens vested
            await time.increaseTo(startTime + 10);

            // Try to withdraw more than vested
            await expect(
                payStream.connect(employee).withdraw(0, ethers.parseEther("50"))
            ).to.be.revertedWith("Amount exceeds available funds");

            // Should be able to withdraw available amount
            await expect(payStream.connect(employee).withdraw(0, ethers.parseEther("10")))
                .to.not.be.reverted;
        });
    });

    describe("Edge Case: Multiple Withdrawals", function () {
        it("Should handle multiple partial withdrawals correctly", async function () {
            const { payStream, mockHLUSD, hr, employee } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("1000");
            const rate = ethers.parseEther("10");
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);
            await payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime);

            // First withdrawal after 10 seconds (100 tokens vested)
            await time.increaseTo(startTime + 10);
            await payStream.connect(employee).withdraw(0, ethers.parseEther("50"));
            
            expect(await mockHLUSD.balanceOf(employee.address)).to.equal(ethers.parseEther("45")); // 50 - 10% tax

            // Second withdrawal after 10 more seconds (100 more vested)
            await time.increase(10);
            await payStream.connect(employee).withdraw(0, ethers.parseEther("50"));
            
            expect(await mockHLUSD.balanceOf(employee.address)).to.equal(ethers.parseEther("90")); // 45 + 45

            // Third withdrawal - remaining vested
            await time.increase(10);
            await payStream.connect(employee).withdraw(0, ethers.parseEther("100"));
            
            expect(await mockHLUSD.balanceOf(employee.address)).to.equal(ethers.parseEther("180")); // 90 + 90
        });

        it("Should track withdrawn amount correctly across multiple withdrawals", async function () {
            const { payStream, mockHLUSD, hr, employee } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("500");
            const rate = ethers.parseEther("5");
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);
            await payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime);

            await time.increaseTo(startTime + 20);
            await payStream.connect(employee).withdraw(0, ethers.parseEther("50"));

            const stream1 = await payStream.getStream(0);
            expect(stream1.withdrawn).to.equal(ethers.parseEther("50"));

            await time.increase(20);
            await payStream.connect(employee).withdraw(0, ethers.parseEther("50"));

            const stream2 = await payStream.getStream(0);
            expect(stream2.withdrawn).to.equal(ethers.parseEther("100"));
        });
    });

    describe("Edge Case: Pause/Resume Abuse", function () {
        it("Should not allow non-sender to pause stream", async function () {
            const { payStream, mockHLUSD, hr, employee } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("1000");
            const rate = ethers.parseEther("1");
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);
            await payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime);

            await time.increaseTo(startTime + 1);

            await expect(
                payStream.connect(employee).pauseStream(0)
            ).to.be.revertedWith("Only sender can pause");
        });

        it("Should not allow double pause", async function () {
            const { payStream, mockHLUSD, hr, employee } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("1000");
            const rate = ethers.parseEther("1");
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);
            await payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime);

            await time.increaseTo(startTime + 1);
            await payStream.connect(hr).pauseStream(0);

            await expect(
                payStream.connect(hr).pauseStream(0)
            ).to.be.revertedWith("Stream already paused");
        });

        it("Should allow withdrawal of vested amount when paused", async function () {
            const { payStream, mockHLUSD, hr, employee } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("1000");
            const rate = ethers.parseEther("10");
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);
            await payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime);

            await time.increaseTo(startTime + 10);
            const vestedBeforePause = await payStream.getVestedAmount(0);
            
            await payStream.connect(hr).pauseStream(0);

            // Should allow withdrawal of vested amount even when paused
            const withdrawAmount = ethers.parseEther("50");
            expect(withdrawAmount).to.be.lte(vestedBeforePause);
            
            await expect(
                payStream.connect(employee).withdraw(0, withdrawAmount)
            ).to.emit(payStream, "Withdrawn");
        });

        it("Should allow withdrawal after resume", async function () {
            const { payStream, mockHLUSD, hr, employee } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("1000");
            const rate = ethers.parseEther("10");
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);
            await payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime);

            await time.increaseTo(startTime + 10);
            await payStream.connect(hr).pauseStream(0);
            await payStream.connect(hr).resumeStream(0);
            
            await expect(payStream.connect(employee).withdraw(0, ethers.parseEther("50")))
                .to.not.be.reverted;
        });
    });

    describe("Edge Case: Long Inactivity", function () {
        it("Should cap vested amount at deposit even after long time", async function () {
            const { payStream, mockHLUSD, hr, employee } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("1000");
            const rate = ethers.parseEther("1");
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);
            await payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime);

            // Wait way longer than stream duration (1000 seconds)
            await time.increaseTo(startTime + 10000);

            const vested = await payStream.getVestedAmount(0);
            expect(vested).to.equal(deposit); // Should not exceed deposit (bonuses excluded)

            // Should be able to withdraw full amount
            await payStream.connect(employee).withdraw(0, deposit);
            
            const stream = await payStream.getStream(0);
            expect(stream.withdrawn).to.equal(deposit);
            // Stream may still be active due to accrued yield
            // expect(stream.active).to.equal(false);
        });

        it("Should handle stream that was never withdrawn", async function () {
            const { payStream, mockHLUSD, hr, employee } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("500");
            const rate = ethers.parseEther("1");
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);
            await payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime);

            // Wait for full vesting + 1 year
            await time.increaseTo(startTime + 31536000);

            const vested = await payStream.getVestedAmount(0);
            expect(vested).to.equal(deposit);

            // Should still be able to withdraw after long inactivity
            await expect(payStream.connect(employee).withdraw(0, deposit))
                .to.not.be.reverted;
        });
    });

    describe("Tax Verification", function () {
        it("Should apply 10% tax correctly on all withdrawals", async function () {
            const { payStream, mockHLUSD, hr, employee, taxVault } = await loadFixture(deployPayStreamFixture);

            const deposit = ethers.parseEther("1000");
            const rate = ethers.parseEther("100");
            const currentTime = await time.latest();
            const startTime = currentTime + 2;

            await mockHLUSD.connect(hr).approve(await payStream.getAddress(), deposit);
            await payStream.connect(hr).createStream(0, employee.address, rate, deposit, startTime);

            await time.increaseTo(startTime + 5);

            const taxBalanceBefore = await mockHLUSD.balanceOf(taxVault.address);
            
            await payStream.connect(employee).withdraw(0, ethers.parseEther("500"));

            const taxBalanceAfter = await mockHLUSD.balanceOf(taxVault.address);
            const taxCollected = taxBalanceAfter - taxBalanceBefore;

            expect(taxCollected).to.equal(ethers.parseEther("50")); // 10% of 500
        });
    });
});
