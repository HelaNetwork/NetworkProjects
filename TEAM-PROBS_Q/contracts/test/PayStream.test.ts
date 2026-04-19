import { expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { PayStream, PayrollTreasury, TaxVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

// Mock HLUSD ERC20 for testing
const MOCK_TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address,uint256) returns (bool)",
    "function allowance(address,address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)",
    "function transferFrom(address,address,uint256) returns (bool)",
    "function mint(address,uint256)"
];

describe("PayStream System", function () {
    let hlusd: any;
    let taxVault: TaxVault;
    let treasury: PayrollTreasury;
    let payStream: PayStream;
    let owner: SignerWithAddress;
    let hr: SignerWithAddress;
    let employee1: SignerWithAddress;
    let employee2: SignerWithAddress;
    let employee3: SignerWithAddress;
    let outsider: SignerWithAddress;

    async function deployFixture() {
        [owner, hr, employee1, employee2, employee3, outsider] = await ethers.getSigners();

        // Deploy mock ERC20
        const MockToken = await ethers.getContractFactory("MockHLUSD");
        hlusd = await MockToken.deploy();
        await hlusd.waitForDeployment();

        // Deploy system
        const TaxVaultFactory = await ethers.getContractFactory("TaxVault");
        taxVault = await TaxVaultFactory.deploy(await hlusd.getAddress());
        await taxVault.waitForDeployment();

        const TreasuryFactory = await ethers.getContractFactory("PayrollTreasury");
        treasury = await TreasuryFactory.deploy(await hlusd.getAddress());
        await treasury.waitForDeployment();

        const PayStreamFactory = await ethers.getContractFactory("PayStream");
        payStream = await PayStreamFactory.deploy(
            await hlusd.getAddress(),
            await treasury.getAddress(),
            await taxVault.getAddress()
        );
        await payStream.waitForDeployment();

        // Wire up
        await treasury.setPayStream(await payStream.getAddress());
        await payStream.grantHR(hr.address);

        // Fund treasury: mint 1M HLUSD → owner → treasury
        const fundAmount = ethers.parseEther("1000000");
        await hlusd.mint(owner.address, fundAmount);
        await hlusd.approve(await treasury.getAddress(), fundAmount);
        await treasury.deposit(fundAmount);

        return { hlusd, taxVault, treasury, payStream, owner, hr, employee1, employee2, employee3, outsider };
    }

    // ─── Helper ───────────────────────────────────────────────────────────
    const MONTH = 30 * 24 * 3600; // ~30 days in seconds
    const SALARY = ethers.parseEther("3000"); // 3000 HLUSD/month

    async function createDefaultStream(emp: SignerWithAddress, start?: number, end?: number) {
        const now = await time.latest();
        const s = start ?? now;
        const e = end ?? (s + MONTH);
        await payStream.connect(hr).createStream(emp.address, SALARY, s, e, 1000);
        return { start: s, end: e };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TESTS
    // ═══════════════════════════════════════════════════════════════════════

    describe("Deployment & Admin", function () {
        it("deploys with correct config", async function () {
            const { payStream, hlusd, treasury, taxVault, owner } = await loadFixture(deployFixture);
            expect(await payStream.hlusd()).to.equal(await hlusd.getAddress());
            expect(await payStream.defaultTaxBps()).to.equal(1000n);
            expect(await payStream.owner()).to.equal(owner.address);
        });

        it("owner can grant/revoke HR", async function () {
            const { payStream, hr, outsider } = await loadFixture(deployFixture);
            expect(await payStream.isHR(hr.address)).to.be.true;
            await payStream.revokeHR(hr.address);
            expect(await payStream.isHR(hr.address)).to.be.false;
        });

        it("non-owner cannot grant HR", async function () {
            const { payStream, outsider, employee1 } = await loadFixture(deployFixture);
            await expect(payStream.connect(outsider).grantHR(employee1.address))
                .to.be.revertedWithCustomError(payStream, "OwnableUnauthorizedAccount");
        });
    });

    describe("Stream Creation", function () {
        it("creates a stream with correct fields", async function () {
            const { payStream, hr, employee1 } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            const end = start + MONTH;

            await payStream.connect(hr).createStream(employee1.address, SALARY, start, end, 1000);

            const s = await payStream.getStream(employee1.address);
            expect(s.employee).to.equal(employee1.address);
            expect(s.status).to.equal(1n); // Active
            expect(s.deposited).to.equal(SALARY);
            expect(s.ratePerSecond).to.equal(SALARY / BigInt(MONTH));
            expect(s.taxBps).to.equal(1000n);
        });

        it("stores remainder correctly", async function () {
            const { payStream, hr, employee1 } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            const duration = 7; // 7 seconds, to get a non-zero remainder
            const end = start + duration;
            const amount = ethers.parseEther("10"); // 10 / 7 has remainder

            await payStream.connect(hr).createStream(employee1.address, amount, start, end, 1000);
            const s = await payStream.getStream(employee1.address);

            const expectedRate = amount / BigInt(duration);
            const expectedRemainder = amount - expectedRate * BigInt(duration);
            expect(s.ratePerSecond).to.equal(expectedRate);
            expect(s.remainder).to.equal(expectedRemainder);
        });

        it("non-HR cannot create stream", async function () {
            const { payStream, outsider, employee1 } = await loadFixture(deployFixture);
            const now = await time.latest();
            await expect(
                payStream.connect(outsider).createStream(employee1.address, SALARY, now, now + MONTH, 1000)
            ).to.be.revertedWith("PayStream: not HR");
        });

        it("cannot create duplicate active stream", async function () {
            const { payStream, hr, employee1 } = await loadFixture(deployFixture);
            const now = await time.latest();
            await payStream.connect(hr).createStream(employee1.address, SALARY, now, now + MONTH, 1000);
            await expect(
                payStream.connect(hr).createStream(employee1.address, SALARY, now, now + MONTH, 1000)
            ).to.be.revertedWith("PayStream: stream exists");
        });
    });

    describe("Batch Creation", function () {
        it("creates multiple streams in batch", async function () {
            const { payStream, hr, employee1, employee2, employee3 } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            const end = start + MONTH;

            await payStream.connect(hr).batchCreateStreams(
                [employee1.address, employee2.address, employee3.address],
                [SALARY, SALARY, SALARY],
                [start, start, start],
                [end, end, end],
                [1000, 1000, 1000]
            );

            expect(await payStream.getEmployeeCount()).to.equal(3n);
            const s1 = await payStream.getStream(employee1.address);
            const s2 = await payStream.getStream(employee2.address);
            expect(s1.status).to.equal(1n);
            expect(s2.status).to.equal(1n);
        });

        it("reverts on array mismatch", async function () {
            const { payStream, hr, employee1 } = await loadFixture(deployFixture);
            const now = await time.latest();
            await expect(
                payStream.connect(hr).batchCreateStreams(
                    [employee1.address],
                    [SALARY, SALARY],
                    [now],
                    [now + MONTH],
                    [1000]
                )
            ).to.be.revertedWith("PayStream: array mismatch");
        });
    });

    describe("Accrual Accuracy", function () {
        it("accrues correctly at start", async function () {
            const { payStream, employee1, hr } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 100;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, start + MONTH, 1000);

            // Before start
            expect(await payStream.earned(employee1.address)).to.equal(0n);
        });

        it("accrues correctly at midpoint", async function () {
            const { payStream, employee1, hr } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            const end = start + MONTH;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, end, 1000);

            // Advance to midpoint
            await time.increaseTo(start + MONTH / 2);
            const earned = await payStream.earned(employee1.address);
            const expectedRate = SALARY / BigInt(MONTH);
            const expected = expectedRate * BigInt(MONTH / 2);
            expect(earned).to.equal(expected);
        });

        it("accrues correctly at end", async function () {
            const { payStream, employee1, hr } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            const end = start + MONTH;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, end, 1000);

            // Advance past end
            await time.increaseTo(end + 100);
            const earned = await payStream.earned(employee1.address);
            const expectedRate = SALARY / BigInt(MONTH);
            const expected = expectedRate * BigInt(MONTH);
            expect(earned).to.equal(expected);
        });
    });

    describe("Pause / Resume", function () {
        it("freezes accrual during pause", async function () {
            const { payStream, employee1, hr } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, start + MONTH, 1000);

            // Advance 10 days, pause
            await time.increaseTo(start + 10 * 86400);
            await payStream.connect(hr).pauseStream(employee1.address);
            const earnedAtPause = await payStream.earned(employee1.address);

            // Advance another 5 days while paused
            await time.increase(5 * 86400);
            const earnedDuringPause = await payStream.earned(employee1.address);
            expect(earnedDuringPause).to.equal(earnedAtPause);
        });

        it("resumes accrual correctly after pause", async function () {
            const { payStream, employee1, hr } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, start + MONTH, 1000);

            // 10 days → pause → 5 days → resume → 5 more days
            await time.increaseTo(start + 10 * 86400);
            await payStream.connect(hr).pauseStream(employee1.address);
            await time.increase(5 * 86400);
            await payStream.connect(hr).resumeStream(employee1.address);
            await time.increase(5 * 86400);

            const earned = await payStream.earned(employee1.address);
            const rate = SALARY / BigInt(MONTH);
            // Active time: 10 days + 5 days = 15 days
            const expected = rate * BigInt(15 * 86400);
            // Allow 2-second tolerance for block timestamps
            const diff = earned > expected ? earned - expected : expected - earned;
            expect(diff <= rate * 2n).to.be.true;
        });

        it("supports multiple pause/resume cycles", async function () {
            const { payStream, employee1, hr } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, start + MONTH, 1000);

            // Cycle 1: 5d active, 3d paused
            await time.increaseTo(start + 5 * 86400);
            await payStream.connect(hr).pauseStream(employee1.address);
            await time.increase(3 * 86400);
            await payStream.connect(hr).resumeStream(employee1.address);

            // Cycle 2: 5d active, 2d paused
            await time.increase(5 * 86400);
            await payStream.connect(hr).pauseStream(employee1.address);
            await time.increase(2 * 86400);
            await payStream.connect(hr).resumeStream(employee1.address);

            // 3 more days active
            await time.increase(3 * 86400);

            const earned = await payStream.earned(employee1.address);
            const rate = SALARY / BigInt(MONTH);
            // Active: 5 + 5 + 3 = 13 days
            const expected = rate * BigInt(13 * 86400);
            const diff = earned > expected ? earned - expected : expected - earned;
            expect(diff <= rate * 4n).to.be.true;
        });

        it("non-HR cannot pause", async function () {
            const { payStream, employee1, hr, outsider } = await loadFixture(deployFixture);
            const now = await time.latest();
            await payStream.connect(hr).createStream(employee1.address, SALARY, now + 10, now + 10 + MONTH, 1000);
            await time.increase(100);
            await expect(payStream.connect(outsider).pauseStream(employee1.address))
                .to.be.revertedWith("PayStream: not HR");
        });
    });

    describe("Cancel", function () {
        it("stops future accrual on cancel", async function () {
            const { payStream, employee1, hr } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, start + MONTH, 1000);

            await time.increaseTo(start + 10 * 86400);
            await payStream.connect(hr).cancelStream(employee1.address);

            const earnedAtCancel = await payStream.earned(employee1.address);

            // Advance more time — earned should not increase
            await time.increase(10 * 86400);
            const earnedAfter = await payStream.earned(employee1.address);
            expect(earnedAfter).to.equal(earnedAtCancel);
        });

        it("employee can withdraw earned after cancel", async function () {
            const { payStream, employee1, hr, hlusd } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, start + MONTH, 1000);

            await time.increaseTo(start + 10 * 86400);
            await payStream.connect(hr).cancelStream(employee1.address);

            const withdrawable = await payStream.withdrawable(employee1.address);
            expect(withdrawable).to.be.gt(0n);

            const balBefore = await hlusd.balanceOf(employee1.address);
            await payStream.connect(employee1).withdraw();
            const balAfter = await hlusd.balanceOf(employee1.address);
            expect(balAfter).to.be.gt(balBefore);
        });

        it("no over-withdrawal after cancel", async function () {
            const { payStream, employee1, hr } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, start + MONTH, 1000);

            await time.increaseTo(start + 10 * 86400);
            await payStream.connect(hr).cancelStream(employee1.address);

            await payStream.connect(employee1).withdraw();

            // Second withdraw should fail
            await expect(payStream.connect(employee1).withdraw())
                .to.be.revertedWith("PayStream: nothing to withdraw");
        });
    });

    describe("Tax Split", function () {
        it("splits tax correctly on withdrawal (10%)", async function () {
            const { payStream, employee1, hr, hlusd, taxVault } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, start + MONTH, 1000);

            await time.increaseTo(start + 15 * 86400);

            const empBalBefore = await hlusd.balanceOf(employee1.address);
            const vaultBalBefore = await hlusd.balanceOf(await taxVault.getAddress());

            await payStream.connect(employee1).withdraw();

            const empBalAfter = await hlusd.balanceOf(employee1.address);
            const vaultBalAfter = await hlusd.balanceOf(await taxVault.getAddress());

            const netReceived = empBalAfter - empBalBefore;
            const taxReceived = vaultBalAfter - vaultBalBefore;
            const totalWithdrawn = netReceived + taxReceived;

            // Tax should be 10% of total withdrawn
            expect(taxReceived).to.equal(totalWithdrawn * 1000n / 10000n);
            // Net should be 90%
            expect(netReceived).to.equal(totalWithdrawn - taxReceived);
        });

        it("tax split correct across multiple withdrawals", async function () {
            const { payStream, employee1, hr, hlusd, taxVault } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, start + MONTH, 1000);

            // First withdrawal at day 10
            await time.increaseTo(start + 10 * 86400);
            await payStream.connect(employee1).withdraw();

            // Second withdrawal at day 20
            await time.increaseTo(start + 20 * 86400);
            const vaultBefore = await hlusd.balanceOf(await taxVault.getAddress());
            const empBefore = await hlusd.balanceOf(employee1.address);

            await payStream.connect(employee1).withdraw();

            const vaultAfter = await hlusd.balanceOf(await taxVault.getAddress());
            const empAfter = await hlusd.balanceOf(employee1.address);

            const taxPaid = vaultAfter - vaultBefore;
            const netPaid = empAfter - empBefore;
            const totalPaid = taxPaid + netPaid;

            // Tax should be exactly 10% of total withdrawn in this tx
            expect(taxPaid).to.equal(totalPaid * 1000n / 10000n);
        });
    });

    describe("Remainder Handling", function () {
        it("total withdrawn + remainder equals deposited at final settlement", async function () {
            const { payStream, employee1, hr, hlusd, taxVault } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            const duration = 7; // force remainder
            const amount = ethers.parseEther("10");
            const end = start + duration;

            await payStream.connect(hr).createStream(employee1.address, amount, start, end, 0); // 0 tax for simple

            // Advance past end
            await time.increaseTo(end + 100);

            // Withdraw everything
            const withdrawable = await payStream.withdrawable(employee1.address);
            await payStream.connect(employee1).withdraw();

            const s = await payStream.getStream(employee1.address);
            // withdrawn should equal full deposited amount
            expect(s.withdrawn).to.equal(amount);
        });
    });

    describe("Access Control", function () {
        it("employee cannot withdraw others' funds", async function () {
            const { payStream, employee1, employee2, hr } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, start + MONTH, 1000);

            await time.increaseTo(start + 5 * 86400);

            // employee2 has no stream
            await expect(payStream.connect(employee2).withdraw())
                .to.be.revertedWith("PayStream: no stream");
        });

        it("non-HR cannot cancel stream", async function () {
            const { payStream, employee1, hr, outsider } = await loadFixture(deployFixture);
            const now = await time.latest();
            const start = now + 10;
            await payStream.connect(hr).createStream(employee1.address, SALARY, start, start + MONTH, 1000);

            await expect(payStream.connect(outsider).cancelStream(employee1.address))
                .to.be.revertedWith("PayStream: not HR");
        });
    });

    describe("Treasury", function () {
        it("shows correct balance", async function () {
            const { treasury } = await loadFixture(deployFixture);
            const bal = await treasury.getBalance();
            expect(bal).to.equal(ethers.parseEther("1000000"));
        });

        it("computes required funding", async function () {
            const { treasury } = await loadFixture(deployFixture);
            const required = await treasury.getRequiredFunding([
                ethers.parseEther("3000"),
                ethers.parseEther("5000"),
                ethers.parseEther("2000")
            ]);
            expect(required).to.equal(ethers.parseEther("10000"));
        });
    });
});
