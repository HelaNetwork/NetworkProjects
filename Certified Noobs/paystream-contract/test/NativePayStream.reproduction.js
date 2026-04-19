
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NativePayStream Upgraded Tests", function () {
    let NativePayStream;
    let paystream;
    let owner, hr, employee1, taxVault;
    const TAX_BPS = 1000; // 10%

    beforeEach(async function () {
        [owner, hr, employee1, taxVault] = await ethers.getSigners();

        NativePayStream = await ethers.getContractFactory("NativePayStream");
        paystream = await NativePayStream.deploy(taxVault.address, TAX_BPS);
        await paystream.waitForDeployment();

        // Add HR
        await paystream.addHR(owner.address);
    });

    it("Accrual & Withdrawal with Tax", async function () {
        const depositAmount = ethers.parseEther("100");
        const duration = 100; // 1 ETH per second

        await paystream.connect(owner).deposit({ value: depositAmount });
        await paystream.connect(owner).createStream(employee1.address, duration, depositAmount);

        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine", []);

        const accrued = await paystream.accrued(0);
        console.log("Accrued 1:", ethers.formatEther(accrued));
        expect(accrued).to.be.closeTo(ethers.parseEther("10"), ethers.parseEther("2.0"));

        const balanceBefore = await ethers.provider.getBalance(employee1.address);
        const vaultBefore = await ethers.provider.getBalance(taxVault.address);

        const tx = await paystream.connect(employee1).withdraw(0);
        await tx.wait();

        const balanceAfter = await ethers.provider.getBalance(employee1.address);
        const vaultAfter = await ethers.provider.getBalance(taxVault.address);

        const expectedNet = ethers.parseEther("9"); // Approx
        const expectedTax = ethers.parseEther("1"); // Approx

        expect(balanceAfter - balanceBefore).to.be.closeTo(expectedNet, ethers.parseEther("2.0"));
        expect(vaultAfter - vaultBefore).to.be.closeTo(expectedTax, ethers.parseEther("0.2"));
    });

    it("Pause and Resume correctly shifts timeline", async function () {
        const depositAmount = ethers.parseEther("100");
        const duration = 100;

        await paystream.connect(owner).deposit({ value: depositAmount });
        await paystream.connect(owner).createStream(employee1.address, duration, depositAmount);

        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine", []);

        await paystream.connect(owner).pauseStream(0);

        let stream = await paystream.streams(0);
        expect(stream.active).to.be.false;

        await ethers.provider.send("evm_increaseTime", [50]);
        await ethers.provider.send("evm_mine", []);

        let accrued = await paystream.accrued(0);
        console.log("Accrued Paused:", ethers.formatEther(accrued));
        expect(accrued).to.be.closeTo(ethers.parseEther("10"), ethers.parseEther("2.0"));

        await paystream.connect(owner).resumeStream(0);

        stream = await paystream.streams(0);
        expect(stream.active).to.be.true;

        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine", []);

        accrued = await paystream.accrued(0);
        console.log("Accrued Resumed:", ethers.formatEther(accrued));
        expect(accrued).to.be.closeTo(ethers.parseEther("20"), ethers.parseEther("3.0"));
    });

    it("Cancel Stream pushes funds and returns remainder", async function () {
        const depositAmount = ethers.parseEther("100");
        const duration = 100;

        await paystream.connect(owner).deposit({ value: depositAmount });
        await paystream.connect(owner).createStream(employee1.address, duration, depositAmount);

        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine", []);

        const balanceBefore = await ethers.provider.getBalance(employee1.address);
        const vaultBefore = await ethers.provider.getBalance(taxVault.address);

        // Debug Accrued
        const accruedDebug = await paystream.accrued(0);
        console.log("Accrued before cancel:", ethers.formatEther(accruedDebug));
        expect(accruedDebug).to.be.closeTo(ethers.parseEther("10"), ethers.parseEther("2.0"));

        // Cancel stream
        const tx = await paystream.connect(owner).cancelStream(0);
        await tx.wait();

        const balanceAfter = await ethers.provider.getBalance(employee1.address);
        const vaultAfter = await ethers.provider.getBalance(taxVault.address);

        // Employee Recv
        const diff = balanceAfter - balanceBefore;
        console.log("Employee received:", ethers.formatEther(diff));
        expect(diff).to.be.closeTo(ethers.parseEther("9"), ethers.parseEther("2.0"));

        // Tax Recv
        const taxDiff = vaultAfter - vaultBefore;
        console.log("Tax Vault received:", ethers.formatEther(taxDiff));
        expect(taxDiff).to.be.closeTo(ethers.parseEther("1"), ethers.parseEther("0.3"));

        // Contract Balance
        // Should be ~89.
        const contractBalance = await ethers.provider.getBalance(await paystream.getAddress());
        console.log("Contract Balance after cancel:", ethers.formatEther(contractBalance));

        expect(contractBalance).to.be.closeTo(ethers.parseEther("89"), ethers.parseEther("2.0"));
    });
});
