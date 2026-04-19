import { expect } from "chai";
import { ethers, waffle } from "hardhat";
import { Contract, Signer, BigNumber } from "ethers";

/**
 * Helper: advance block time by `seconds` and mine a block.
 */
async function increaseTime(seconds: number): Promise<void> {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
}

/**
 * Helper: get the latest block timestamp.
 */
async function latestTimestamp(): Promise<number> {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
}

describe("StreamManager", function () {
    let owner: Signer;
    let employee: Signer;
    let relayer: Signer;
    let other: Signer;
    let ownerAddr: string;
    let employeeAddr: string;
    let relayerAddr: string;

    let hlusd: Contract;
    let taxVault: Contract;
    let yieldVault: Contract;
    let streamManager: Contract;

    const MINT_AMOUNT = ethers.utils.parseEther("1000000"); // 1M HLUSD
    const TREASURY_AMOUNT = ethers.utils.parseEther("100000"); // 100K HLUSD
    const RATE_PER_SECOND = ethers.utils.parseEther("1"); // 1 HLUSD / sec
    const TAX_BPS = 500; // 5%

    beforeEach(async function () {
        [owner, employee, relayer, other] = await ethers.getSigners();
        ownerAddr = await owner.getAddress();
        employeeAddr = await employee.getAddress();
        relayerAddr = await relayer.getAddress();

        // Deploy HLUSDMock
        const HLUSDMock = await ethers.getContractFactory("HLUSDMock");
        hlusd = await HLUSDMock.deploy();
        await hlusd.deployed();

        // Deploy TaxVault
        const TaxVault = await ethers.getContractFactory("TaxVault");
        taxVault = await TaxVault.deploy(hlusd.address);
        await taxVault.deployed();

        // Deploy YieldVault
        const YieldVault = await ethers.getContractFactory("YieldVault");
        yieldVault = await YieldVault.deploy(hlusd.address);
        await yieldVault.deployed();

        // Deploy StreamManager (now takes 3 args: hlusd, taxVault, yieldVault)
        const StreamManager = await ethers.getContractFactory("StreamManager");
        streamManager = await StreamManager.deploy(hlusd.address, taxVault.address, yieldVault.address);
        await streamManager.deployed();

        // Transfer YieldVault ownership to StreamManager so it can deposit/withdraw
        await yieldVault.connect(owner).transferOwnership(streamManager.address);

        // Mint HLUSD to owner and approve StreamManager
        await hlusd.mint(ownerAddr, MINT_AMOUNT);
        await hlusd.connect(owner).approve(streamManager.address, ethers.constants.MaxUint256);
    });

    // ─────────────────── Deployment ──────────────────────────

    describe("Deployment", function () {
        it("should set HLUSD address correctly", async function () {
            expect(await streamManager.HLUSD()).to.equal(hlusd.address);
        });

        it("should set taxVault address correctly", async function () {
            expect(await streamManager.taxVault()).to.equal(taxVault.address);
        });

        it("should set nextStreamId to 0", async function () {
            expect(await streamManager.nextStreamId()).to.equal(0);
        });

        it("should set yieldVault address correctly", async function () {
            expect(await streamManager.yieldVault()).to.equal(yieldVault.address);
        });

        it("should revert on zero HLUSD address", async function () {
            const SM = await ethers.getContractFactory("StreamManager");
            await expect(
                SM.deploy(ethers.constants.AddressZero, taxVault.address, yieldVault.address)
            ).to.be.revertedWith("ZeroAddress");
        });

        it("should revert on zero taxVault address", async function () {
            const SM = await ethers.getContractFactory("StreamManager");
            await expect(
                SM.deploy(hlusd.address, ethers.constants.AddressZero, yieldVault.address)
            ).to.be.revertedWith("ZeroAddress");
        });

        it("should revert on zero yieldVault address", async function () {
            const SM = await ethers.getContractFactory("StreamManager");
            await expect(
                SM.deploy(hlusd.address, taxVault.address, ethers.constants.AddressZero)
            ).to.be.revertedWith("ZeroAddress");
        });
    });

    // ─────────────────── depositTreasury ─────────────────────

    describe("depositTreasury", function () {
        it("should transfer HLUSD and update treasuryBalance", async function () {
            await streamManager.connect(owner).depositTreasury(TREASURY_AMOUNT);

            expect(await streamManager.treasuryBalance()).to.equal(TREASURY_AMOUNT);
            // HLUSD now lives in YieldVault, not StreamManager directly
            expect(await hlusd.balanceOf(yieldVault.address)).to.equal(TREASURY_AMOUNT);
        });

        it("should emit TreasuryDeposited event", async function () {
            await expect(streamManager.connect(owner).depositTreasury(TREASURY_AMOUNT))
                .to.emit(streamManager, "TreasuryDeposited")
                .withArgs(ownerAddr, TREASURY_AMOUNT);
        });

        it("should revert when amount is zero", async function () {
            await expect(
                streamManager.connect(owner).depositTreasury(0)
            ).to.be.revertedWith("ZeroAmount");
        });

        it("should revert when called by non-owner", async function () {
            await expect(
                streamManager.connect(other).depositTreasury(TREASURY_AMOUNT)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    // ─────────────────── createStream ────────────────────────

    describe("createStream", function () {
        beforeEach(async function () {
            await streamManager.connect(owner).depositTreasury(TREASURY_AMOUNT);
        });

        it("should create a stream and emit StreamCreated", async function () {
            await expect(
                streamManager.connect(owner).createStream(employeeAddr, RATE_PER_SECOND, TAX_BPS)
            )
                .to.emit(streamManager, "StreamCreated")
                .withArgs(0, employeeAddr);
        });

        it("should store correct stream data", async function () {
            await streamManager.connect(owner).createStream(employeeAddr, RATE_PER_SECOND, TAX_BPS);

            const info = await streamManager.streamInfo(0);
            expect(info.employee).to.equal(employeeAddr);
            expect(info.ratePerSecond).to.equal(RATE_PER_SECOND);
            expect(info.taxBps).to.equal(TAX_BPS);
            expect(info.active).to.be.true;
            expect(info.paused).to.be.false;
        });

        it("should increment nextStreamId", async function () {
            await streamManager.connect(owner).createStream(employeeAddr, RATE_PER_SECOND, TAX_BPS);
            expect(await streamManager.nextStreamId()).to.equal(1);
        });

        it("should revert with zero employee address", async function () {
            await expect(
                streamManager.connect(owner).createStream(ethers.constants.AddressZero, RATE_PER_SECOND, TAX_BPS)
            ).to.be.revertedWith("ZeroAddress");
        });

        it("should revert with zero rate", async function () {
            await expect(
                streamManager.connect(owner).createStream(employeeAddr, 0, TAX_BPS)
            ).to.be.revertedWith("InvalidRate");
        });

        it("should revert with taxBps > 10000", async function () {
            await expect(
                streamManager.connect(owner).createStream(employeeAddr, RATE_PER_SECOND, 10001)
            ).to.be.revertedWith("InvalidTaxBps");
        });
    });

    // ────────────── Accrued salary math ──────────────────────

    describe("Accrued salary math", function () {
        beforeEach(async function () {
            await streamManager.connect(owner).depositTreasury(TREASURY_AMOUNT);
            await streamManager.connect(owner).createStream(employeeAddr, RATE_PER_SECOND, TAX_BPS);
        });

        it("should accrue salary linearly with time", async function () {
            await increaseTime(100);
            const accrued = await streamManager.accruedSalary(0);
            // ratePerSecond * 100 seconds = 100 HLUSD (may be +/- 1s)
            expect(accrued).to.be.gte(ethers.utils.parseEther("100"));
            expect(accrued).to.be.lte(ethers.utils.parseEther("102"));
        });

        it("netWithdrawable should be 95% of accrued (5% tax)", async function () {
            await increaseTime(100);
            const accrued = await streamManager.accruedSalary(0);
            const net = await streamManager.netWithdrawable(0);
            const expectedNet = accrued.mul(9500).div(10000);
            expect(net).to.equal(expectedNet);
        });
    });

    // ──────────────────── withdraw ───────────────────────────

    describe("withdraw", function () {
        beforeEach(async function () {
            await streamManager.connect(owner).depositTreasury(TREASURY_AMOUNT);
            await streamManager.connect(owner).createStream(employeeAddr, RATE_PER_SECOND, TAX_BPS);
        });

        it("should transfer correct gross/tax/net amounts", async function () {
            await increaseTime(100);

            const balBefore = await hlusd.balanceOf(employeeAddr);
            const taxBefore = await hlusd.balanceOf(taxVault.address);

            const tx = await streamManager.connect(employee).withdraw(0);
            const receipt = await tx.wait();

            // Parse the Withdrawn event
            const event = receipt.events?.find((e: any) => e.event === "Withdrawn");
            const gross = event.args.gross;
            const tax = event.args.tax;
            const net = event.args.net;

            expect(tax).to.equal(gross.mul(TAX_BPS).div(10000));
            expect(net).to.equal(gross.sub(tax));

            const balAfter = await hlusd.balanceOf(employeeAddr);
            const taxAfter = await hlusd.balanceOf(taxVault.address);

            expect(balAfter.sub(balBefore)).to.equal(net);
            expect(taxAfter.sub(taxBefore)).to.equal(tax);
        });

        it("should reset accrued to 0 after withdrawal", async function () {
            await increaseTime(50);
            await streamManager.connect(employee).withdraw(0);

            // Immediately after, accrued should be ~0
            const accrued = await streamManager.accruedSalary(0);
            expect(accrued).to.be.lte(ethers.utils.parseEther("1")); // ~0–1s
        });

        it("should include bonus in gross when claimable", async function () {
            const bonusAmount = ethers.utils.parseEther("500");
            const now = await latestTimestamp();
            const releaseTime = now + 50;

            await streamManager.connect(owner).scheduleBonus(0, bonusAmount, releaseTime);

            // Advance past bonus release time
            await increaseTime(100);

            const tx = await streamManager.connect(employee).withdraw(0);
            const receipt = await tx.wait();
            const event = receipt.events?.find((e: any) => e.event === "Withdrawn");

            // gross should include both accrued salary AND bonus
            const gross = event.args.gross;
            const expectedAccrued = RATE_PER_SECOND.mul(100); // ~100s
            expect(gross).to.be.gte(expectedAccrued.add(bonusAmount).sub(ethers.utils.parseEther("5")));

            // bonusClaimed should be true
            const info = await streamManager.streamInfo(0);
            expect(info.bonusClaimed).to.be.true;
        });

        it("should NOT include bonus before release time", async function () {
            const bonusAmount = ethers.utils.parseEther("500");
            const now = await latestTimestamp();
            const releaseTime = now + 1000; // far in the future

            await streamManager.connect(owner).scheduleBonus(0, bonusAmount, releaseTime);

            await increaseTime(50);

            const tx = await streamManager.connect(employee).withdraw(0);
            const receipt = await tx.wait();
            const event = receipt.events?.find((e: any) => e.event === "Withdrawn");

            const gross = event.args.gross;
            // gross should be roughly 50 HLUSD (no bonus)
            expect(gross).to.be.lte(ethers.utils.parseEther("55"));
        });

        it("should revert if stream is inactive", async function () {
            await streamManager.connect(owner).cancelStream(0);
            await expect(
                streamManager.connect(employee).withdraw(0)
            ).to.be.revertedWith("StreamInactive");
        });

        it("should revert if stream is paused", async function () {
            await streamManager.connect(owner).pauseStream(0);
            await expect(
                streamManager.connect(employee).withdraw(0)
            ).to.be.revertedWith("AlreadyPaused");
        });
    });

    // ────────────── batchCreateStreams ────────────────────────

    describe("batchCreateStreams", function () {
        beforeEach(async function () {
            await streamManager.connect(owner).depositTreasury(TREASURY_AMOUNT);
        });

        it("should create multiple streams", async function () {
            const addr1 = await employee.getAddress();
            const addr2 = await relayer.getAddress();

            const inputs = [
                { employee: addr1, ratePerSecond: RATE_PER_SECOND, taxBps: TAX_BPS },
                { employee: addr2, ratePerSecond: RATE_PER_SECOND.div(2), taxBps: 1000 },
            ];

            await streamManager.connect(owner).batchCreateStreams(inputs);

            expect(await streamManager.nextStreamId()).to.equal(2);

            const info0 = await streamManager.streamInfo(0);
            expect(info0.employee).to.equal(addr1);
            expect(info0.ratePerSecond).to.equal(RATE_PER_SECOND);

            const info1 = await streamManager.streamInfo(1);
            expect(info1.employee).to.equal(addr2);
            expect(info1.taxBps).to.equal(1000);
        });

        it("should emit StreamCreated for each stream", async function () {
            const addr1 = await employee.getAddress();
            const inputs = [
                { employee: addr1, ratePerSecond: RATE_PER_SECOND, taxBps: TAX_BPS },
            ];

            await expect(streamManager.connect(owner).batchCreateStreams(inputs))
                .to.emit(streamManager, "StreamCreated")
                .withArgs(0, addr1);
        });

        it("should revert with empty inputs", async function () {
            await expect(
                streamManager.connect(owner).batchCreateStreams([])
            ).to.be.revertedWith("InvalidBatchSize");
        });
    });

    // ────────────── withdrawSigned (EIP-712) ─────────────────

    describe("withdrawSigned", function () {
        const SPONSOR_AMOUNT = ethers.utils.parseEther("10000");
        const RELAYER_FEE = ethers.utils.parseEther("1");

        beforeEach(async function () {
            await streamManager.connect(owner).depositTreasury(TREASURY_AMOUNT);
            await streamManager.connect(owner).createStream(employeeAddr, RATE_PER_SECOND, TAX_BPS);

            // Fund sponsorship pool
            await streamManager.connect(owner).depositSponsorshipPool(SPONSOR_AMOUNT);
        });

        /**
         * Build and sign an EIP-712 WithdrawPayload.
         */
        async function signWithdraw(
            signer: Signer,
            streamId: number,
            nonce: number,
            deadline: number
        ): Promise<string> {
            const domain = {
                name: "PayStream",
                version: "1",
                chainId: (await ethers.provider.getNetwork()).chainId,
                verifyingContract: streamManager.address,
            };

            const types = {
                WithdrawPayload: [
                    { name: "streamId", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                ],
            };

            const value = { streamId, nonce, deadline };

            return (signer as any)._signTypedData(domain, types, value);
        }

        it("happy path: relayer submits on behalf of employee", async function () {
            await increaseTime(100);

            const now = await latestTimestamp();
            const deadline = now + 600;

            const signature = await signWithdraw(employee, 0, 0, deadline);

            const balBefore = await hlusd.balanceOf(employeeAddr);
            const relayerBefore = await hlusd.balanceOf(relayerAddr);

            await streamManager
                .connect(relayer)
                .withdrawSigned(0, 0, deadline, RELAYER_FEE, signature);

            const balAfter = await hlusd.balanceOf(employeeAddr);
            const relayerAfter = await hlusd.balanceOf(relayerAddr);

            // Employee received net payment
            expect(balAfter.sub(balBefore)).to.be.gt(0);
            // Relayer received fee from sponsorship pool
            expect(relayerAfter.sub(relayerBefore)).to.equal(RELAYER_FEE);
        });

        it("should increment nonce after successful meta-tx", async function () {
            await increaseTime(50);
            const now = await latestTimestamp();
            const deadline = now + 600;

            const sig = await signWithdraw(employee, 0, 0, deadline);
            await streamManager.connect(relayer).withdrawSigned(0, 0, deadline, 0, sig);

            expect(await streamManager.nonces(employeeAddr)).to.equal(1);
        });

        it("should reject replay (same nonce)", async function () {
            await increaseTime(50);
            const now = await latestTimestamp();
            const deadline = now + 600;

            const sig = await signWithdraw(employee, 0, 0, deadline);
            await streamManager.connect(relayer).withdrawSigned(0, 0, deadline, 0, sig);

            // Replay same signature
            await increaseTime(50);
            await expect(
                streamManager.connect(relayer).withdrawSigned(0, 0, deadline, 0, sig)
            ).to.be.revertedWith("InvalidNonce");
        });

        it("should reject expired deadline", async function () {
            const now = await latestTimestamp();
            const deadline = now - 1; // already expired

            const sig = await signWithdraw(employee, 0, 0, deadline);
            await expect(
                streamManager.connect(relayer).withdrawSigned(0, 0, deadline, 0, sig)
            ).to.be.revertedWith("SignatureExpired");
        });

        it("should reject wrong signer", async function () {
            await increaseTime(50);
            const now = await latestTimestamp();
            const deadline = now + 600;

            // Sign with `other` instead of `employee`
            const sig = await signWithdraw(other, 0, 0, deadline);
            await expect(
                streamManager.connect(relayer).withdrawSigned(0, 0, deadline, 0, sig)
            ).to.be.revertedWith("InvalidSignature");
        });
    });
});
