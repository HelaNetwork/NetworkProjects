const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("PayStream", function () {
    // ──────────────────────────────────────────────
    //  Fixture — shared deployment for all tests
    // ──────────────────────────────────────────────

    async function deployPayStreamFixture() {
        const [admin, hr, employee1, employee2, outsider] =
            await ethers.getSigners();

        // Deploy mock token (1 million supply to admin)
        const MockToken = await ethers.getContractFactory("MockToken");
        const token = await MockToken.deploy(
            "PayStream Token",
            "PST",
            ethers.parseEther("1000000")
        );

        // Deploy TaxVault
        const TaxVault = await ethers.getContractFactory("TaxVault");
        const taxVault = await TaxVault.deploy(
            await token.getAddress(),
            admin.address
        );

        // Deploy PayStream with 10% tax (1000 bp)
        const PayStream = await ethers.getContractFactory("PayStream");
        const payStream = await PayStream.deploy(
            await token.getAddress(),
            await taxVault.getAddress(),
            1000 // 10%
        );

        // Grant HR_ROLE to `hr` signer
        const HR_ROLE = await payStream.HR_ROLE();
        await payStream.grantRole(HR_ROLE, hr.address);

        // Fund PayStream with 500k tokens
        const fundAmount = ethers.parseEther("500000");
        await token.approve(await payStream.getAddress(), fundAmount);
        await payStream.fundContract(fundAmount);

        return { token, taxVault, payStream, admin, hr, employee1, employee2, outsider, HR_ROLE };
    }

    // ──────────────────────────────────────────────
    //  Stream Creation
    // ──────────────────────────────────────────────

    describe("Stream Creation", function () {
        it("should allow HR to create a stream", async function () {
            const { payStream, hr, employee1 } = await loadFixture(
                deployPayStreamFixture
            );

            const rate = ethers.parseEther("0.01"); // 0.01 token/sec
            await expect(
                payStream.connect(hr).createStream(employee1.address, rate)
            )
                .to.emit(payStream, "StreamCreated")
                .withArgs(0, hr.address, employee1.address, rate);

            const stream = await payStream.getStream(0);
            expect(stream.employer).to.equal(hr.address);
            expect(stream.employee).to.equal(employee1.address);
            expect(stream.ratePerSecond).to.equal(rate);
            expect(stream.active).to.be.true;
        });

        it("should reject zero employee address", async function () {
            const { payStream, hr } = await loadFixture(deployPayStreamFixture);
            await expect(
                payStream
                    .connect(hr)
                    .createStream(ethers.ZeroAddress, ethers.parseEther("0.01"))
            ).to.be.revertedWith("PayStream: zero employee");
        });

        it("should reject zero rate", async function () {
            const { payStream, hr, employee1 } = await loadFixture(
                deployPayStreamFixture
            );
            await expect(
                payStream.connect(hr).createStream(employee1.address, 0)
            ).to.be.revertedWith("PayStream: zero rate");
        });

        it("should increment stream count", async function () {
            const { payStream, hr, employee1, employee2 } = await loadFixture(
                deployPayStreamFixture
            );
            const rate = ethers.parseEther("0.01");

            await payStream.connect(hr).createStream(employee1.address, rate);
            await payStream.connect(hr).createStream(employee2.address, rate);

            expect(await payStream.getStreamCount()).to.equal(2);
        });
    });

    // ──────────────────────────────────────────────
    //  Withdrawal Correctness
    // ──────────────────────────────────────────────

    describe("Withdrawal", function () {
        it("should calculate correct accrued after elapsed time", async function () {
            const { payStream, hr, employee1 } = await loadFixture(
                deployPayStreamFixture
            );

            const rate = ethers.parseEther("1"); // 1 token/sec
            await payStream.connect(hr).createStream(employee1.address, rate);

            // Advance 100 seconds
            await time.increase(100);

            const accrued = await payStream.calculateAccrued(0);
            // Should be ~100 tokens (could be 100 or 101 due to block timing)
            expect(accrued).to.be.gte(ethers.parseEther("100"));
            expect(accrued).to.be.lte(ethers.parseEther("102"));
        });

        it("should transfer correct amounts on withdraw", async function () {
            const { payStream, token, hr, employee1 } = await loadFixture(
                deployPayStreamFixture
            );

            const rate = ethers.parseEther("1"); // 1 token/sec
            await payStream.connect(hr).createStream(employee1.address, rate);

            // Advance 100 seconds
            await time.increase(100);

            const balanceBefore = await token.balanceOf(employee1.address);
            await payStream.connect(employee1).withdraw(0);
            const balanceAfter = await token.balanceOf(employee1.address);

            const received = balanceAfter - balanceBefore;
            // Employee should receive ~90% of ~101 tokens
            expect(received).to.be.gte(ethers.parseEther("90"));
        });
    });

    // ──────────────────────────────────────────────
    //  Tax Split Correctness
    // ──────────────────────────────────────────────

    describe("Tax Split", function () {
        it("should send correct tax to vault", async function () {
            const { payStream, taxVault, hr, employee1 } = await loadFixture(
                deployPayStreamFixture
            );

            const rate = ethers.parseEther("10"); // 10 tokens/sec
            await payStream.connect(hr).createStream(employee1.address, rate);

            // Advance 10 seconds → 100 tokens accrued
            await time.increase(10);

            const vaultBefore = await taxVault.getBalance();
            await payStream.connect(employee1).withdraw(0);
            const vaultAfter = await taxVault.getBalance();

            const taxCollected = vaultAfter - vaultBefore;
            // Tax should be ~10% of ~110 tokens (10 + 1 for the withdraw block)
            expect(taxCollected).to.be.gte(ethers.parseEther("10"));
        });
    });

    // ──────────────────────────────────────────────
    //  Access Control
    // ──────────────────────────────────────────────

    describe("Access Control", function () {
        it("should reject non-HR from creating streams", async function () {
            const { payStream, outsider, employee1 } = await loadFixture(
                deployPayStreamFixture
            );
            await expect(
                payStream
                    .connect(outsider)
                    .createStream(employee1.address, ethers.parseEther("1"))
            ).to.be.reverted;
        });

        it("should reject non-HR from pausing streams", async function () {
            const { payStream, hr, outsider, employee1 } = await loadFixture(
                deployPayStreamFixture
            );
            await payStream
                .connect(hr)
                .createStream(employee1.address, ethers.parseEther("1"));

            await expect(
                payStream.connect(outsider).pauseStream(0)
            ).to.be.reverted;
        });

        it("should reject non-employee from withdrawing", async function () {
            const { payStream, hr, employee1, outsider } = await loadFixture(
                deployPayStreamFixture
            );
            await payStream
                .connect(hr)
                .createStream(employee1.address, ethers.parseEther("1"));
            await time.increase(10);

            await expect(
                payStream.connect(outsider).withdraw(0)
            ).to.be.revertedWith("PayStream: not your stream");
        });
    });

    // ──────────────────────────────────────────────
    //  Pause / Cancel
    // ──────────────────────────────────────────────

    describe("Pause and Cancel", function () {
        it("should pause a stream and block further withdrawal", async function () {
            const { payStream, hr, employee1 } = await loadFixture(
                deployPayStreamFixture
            );
            await payStream
                .connect(hr)
                .createStream(employee1.address, ethers.parseEther("1"));
            await time.increase(10);

            await payStream.connect(hr).pauseStream(0);

            const stream = await payStream.getStream(0);
            expect(stream.active).to.be.false;

            await expect(
                payStream.connect(employee1).withdraw(0)
            ).to.be.revertedWith("PayStream: stream inactive");
        });

        it("should resume a paused stream", async function () {
            const { payStream, hr, employee1 } = await loadFixture(
                deployPayStreamFixture
            );
            await payStream
                .connect(hr)
                .createStream(employee1.address, ethers.parseEther("1"));

            await payStream.connect(hr).pauseStream(0);
            await payStream.connect(hr).resumeStream(0);

            const stream = await payStream.getStream(0);
            expect(stream.active).to.be.true;
        });

        it("should cancel stream and auto-claim remaining", async function () {
            const { payStream, token, hr, employee1 } = await loadFixture(
                deployPayStreamFixture
            );
            await payStream
                .connect(hr)
                .createStream(employee1.address, ethers.parseEther("1"));
            await time.increase(50);

            const balanceBefore = await token.balanceOf(employee1.address);
            await payStream.connect(hr).cancelStream(0);
            const balanceAfter = await token.balanceOf(employee1.address);

            // Employee should have received auto-claimed funds
            expect(balanceAfter).to.be.gt(balanceBefore);

            const stream = await payStream.getStream(0);
            expect(stream.active).to.be.false;
        });
    });

    // ──────────────────────────────────────────────
    //  Edge Cases
    // ──────────────────────────────────────────────

    describe("Edge Cases", function () {
        it("should handle zero accrued gracefully", async function () {
            const { payStream, hr, employee1 } = await loadFixture(
                deployPayStreamFixture
            );
            await payStream
                .connect(hr)
                .createStream(employee1.address, ethers.parseEther("1"));

            // Withdraw immediately — 0 or 1 second elapsed
            await payStream.connect(employee1).withdraw(0);
            // No revert = success
        });

        it("should handle multiple streams for same employee", async function () {
            const { payStream, hr, employee1 } = await loadFixture(
                deployPayStreamFixture
            );
            await payStream
                .connect(hr)
                .createStream(employee1.address, ethers.parseEther("1"));
            await payStream
                .connect(hr)
                .createStream(employee1.address, ethers.parseEther("2"));

            await time.increase(10);

            // Can withdraw from both
            await payStream.connect(employee1).withdraw(0);
            await payStream.connect(employee1).withdraw(1);
        });

        it("should revert on non-existent stream", async function () {
            const { payStream, employee1 } = await loadFixture(
                deployPayStreamFixture
            );
            await expect(
                payStream.connect(employee1).withdraw(99)
            ).to.be.revertedWith("PayStream: stream does not exist");
        });
    });

    // ──────────────────────────────────────────────
    //  Tax Rate Configuration
    // ──────────────────────────────────────────────

    describe("Tax Rate Configuration", function () {
        it("should allow admin to change tax rate", async function () {
            const { payStream, admin } = await loadFixture(deployPayStreamFixture);

            await expect(payStream.connect(admin).setTaxRate(2000))
                .to.emit(payStream, "TaxRateUpdated")
                .withArgs(1000, 2000);

            expect(await payStream.taxBasisPoints()).to.equal(2000);
        });

        it("should reject non-admin from changing tax rate", async function () {
            const { payStream, outsider } = await loadFixture(
                deployPayStreamFixture
            );
            await expect(
                payStream.connect(outsider).setTaxRate(2000)
            ).to.be.reverted;
        });

        it("should reject tax > 100%", async function () {
            const { payStream, admin } = await loadFixture(deployPayStreamFixture);
            await expect(
                payStream.connect(admin).setTaxRate(10001)
            ).to.be.revertedWith("PayStream: tax > 100%");
        });
    });

    // ──────────────────────────────────────────────
    //  Treasury
    // ──────────────────────────────────────────────

    describe("Treasury", function () {
        it("should report correct treasury balance", async function () {
            const { payStream } = await loadFixture(deployPayStreamFixture);
            const balance = await payStream.getTreasuryBalance();
            expect(balance).to.equal(ethers.parseEther("500000"));
        });

        it("should allow funding the contract", async function () {
            const { payStream, token, admin } = await loadFixture(
                deployPayStreamFixture
            );
            const amount = ethers.parseEther("1000");
            await token.connect(admin).approve(await payStream.getAddress(), amount);

            await expect(payStream.connect(admin).fundContract(amount))
                .to.emit(payStream, "ContractFunded")
                .withArgs(admin.address, amount);
        });
    });
});
