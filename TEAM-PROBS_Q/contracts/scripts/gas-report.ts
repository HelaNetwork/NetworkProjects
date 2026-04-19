import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function main() {
    console.log("═══════════════════════════════════════════");
    console.log("   PayStream Gas Measurement Report");
    console.log("═══════════════════════════════════════════\n");

    const [owner, hr, ...emps] = await ethers.getSigners();

    // Deploy mock system
    const MockToken = await ethers.getContractFactory("MockHLUSD");
    const hlusd = await MockToken.deploy();
    await hlusd.waitForDeployment();

    const TaxVault = await ethers.getContractFactory("TaxVault");
    const taxVault = await TaxVault.deploy(await hlusd.getAddress());
    await taxVault.waitForDeployment();

    const Treasury = await ethers.getContractFactory("PayrollTreasury");
    const treasury = await Treasury.deploy(await hlusd.getAddress());
    await treasury.waitForDeployment();

    const PayStream = await ethers.getContractFactory("PayStream");
    const payStream = await PayStream.deploy(
        await hlusd.getAddress(),
        await treasury.getAddress(),
        await taxVault.getAddress()
    );
    await payStream.waitForDeployment();

    await treasury.setPayStream(await payStream.getAddress());
    await payStream.grantHR(hr.address);

    // Fund treasury
    const bigFund = ethers.parseEther("10000000");
    await hlusd.mint(owner.address, bigFund);
    await hlusd.approve(await treasury.getAddress(), bigFund);
    await treasury.deposit(bigFund);

    const MONTH = 30 * 86400;
    const SALARY = ethers.parseEther("3000");
    const now = (await ethers.provider.getBlock("latest"))!.timestamp;
    const start = now + 100;
    const end = start + MONTH;

    // ─── 1. Single createStream ───────────────────────────────────────
    console.log("1. Single createStream:");
    const addr1 = ethers.Wallet.createRandom().address;
    const tx1 = await payStream.connect(hr).createStream(addr1, SALARY, start, end, 1000);
    const r1 = await tx1.wait();
    console.log(`   Gas used: ${r1!.gasUsed.toString()}\n`);

    // ─── 2. Batch for N=10 ────────────────────────────────────────────
    async function measureBatch(n: number) {
        const addrs: string[] = [];
        const amounts: bigint[] = [];
        const starts: number[] = [];
        const ends_arr: number[] = [];
        const taxes: number[] = [];

        for (let i = 0; i < n; i++) {
            addrs.push(ethers.Wallet.createRandom().address);
            amounts.push(SALARY);
            starts.push(start);
            ends_arr.push(end);
            taxes.push(1000);
        }

        const tx = await payStream.connect(hr).batchCreateStreams(addrs, amounts, starts, ends_arr, taxes);
        const receipt = await tx.wait();
        return receipt!.gasUsed;
    }

    console.log("2. Batch createStreams (N=10):");
    const gas10 = await measureBatch(10);
    console.log(`   Gas used: ${gas10.toString()}`);
    console.log(`   Per stream: ${(gas10 / 10n).toString()}\n`);

    console.log("3. Batch createStreams (N=50):");
    const gas50 = await measureBatch(50);
    console.log(`   Gas used: ${gas50.toString()}`);
    console.log(`   Per stream: ${(gas50 / 50n).toString()}\n`);

    console.log("4. Batch createStreams (N=100):");
    const gas100 = await measureBatch(100);
    console.log(`   Gas used: ${gas100.toString()}`);
    console.log(`   Per stream: ${(gas100 / 100n).toString()}\n`);

    // ─── Summary ──────────────────────────────────────────────────────
    console.log("═══════════════════════════════════════════");
    console.log("   Summary: Gas per stream");
    console.log("═══════════════════════════════════════════");
    console.log(`   Single:    ${r1!.gasUsed.toString()}`);
    console.log(`   Batch 10:  ${(gas10 / 10n).toString()} (-${(100n - (gas10 * 100n / (r1!.gasUsed * 10n))).toString()}%)`);
    console.log(`   Batch 50:  ${(gas50 / 50n).toString()} (-${(100n - (gas50 * 100n / (r1!.gasUsed * 50n))).toString()}%)`);
    console.log(`   Batch 100: ${(gas100 / 100n).toString()} (-${(100n - (gas100 * 100n / (r1!.gasUsed * 100n))).toString()}%)`);
    console.log("═══════════════════════════════════════════\n");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
