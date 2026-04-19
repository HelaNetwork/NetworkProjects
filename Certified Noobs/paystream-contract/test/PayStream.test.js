const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PayStream", function () {
  let PayStream, TaxVault;
  let paystream, taxVault, hlusd;
  let owner, employee1, employee2;

  beforeEach(async function () {
    [owner, employee1, employee2] = await ethers.getSigners();

    const MockToken = await ethers.getContractFactory("MockHLUSD");
    hlusd = await MockToken.deploy();
    await hlusd.waitForDeployment();
n
    TaxVault = await ethers.getContractFactory("TaxVault");
    taxVault = await TaxVault.deploy(owner.address);
    await taxVault.waitForDeployment();

    PayStream = await ethers.getContractFactory("PayStream");
    paystream = await PayStream.deploy(await hlusd.getAddress(), await taxVault.getAddress());
    await paystream.waitForDeployment();

    await hlusd.mint(owner.address, ethers.parseEther("100000"));
    await hlusd.connect(owner).approve(await paystream.getAddress(), ethers.MaxUint256);
  });

  it("should start stream and compute accrued correctly", async function () {
    await paystream.startStream(employee1.address, ethers.parseEther("1"), 1000); // 1 HLUSD/s, 10% tax
    await ethers.provider.send("evm_increaseTime", [10]);
    await ethers.provider.send("evm_mine", []);
    const [gross, tax, net] = await paystream.getAccrued(employee1.address);
    expect(gross).to.equal(ethers.parseEther("10"));
    expect(tax).to.equal(ethers.parseEther("1"));
    expect(net).to.equal(ethers.parseEther("9"));
  });

  it("should allow claim and send net to employee, tax to vault", async function () {
    await hlusd.mint(await paystream.getAddress(), ethers.parseEther("1000"));
    await paystream.startStream(employee1.address, ethers.parseEther("1"), 1000);
    await ethers.provider.send("evm_increaseTime", [10]);
    await ethers.provider.send("evm_mine", []);
    await paystream.connect(employee1).claim();
    const empBalance = await hlusd.balanceOf(employee1.address);
    const vaultBalance = await hlusd.balanceOf(await taxVault.getAddress());
    expect(empBalance).to.be.gte(ethers.parseEther("9"));
    expect(vaultBalance).to.be.gte(ethers.parseEther("1"));
  });
});
