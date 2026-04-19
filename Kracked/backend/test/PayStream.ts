import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

const { viem, networkHelpers } = await hre.network.connect();

function tokens(n: number): bigint {
  return BigInt(n) * 10n ** 18n;
}

async function deployFixture() {
  const [hr, employee] = await viem.getWalletClients();

  const hlusd = await viem.deployContract("MockHLUSD");

  const payStream = await viem.deployContract("PayStream", [hlusd.address]);

  return { hlusd, payStream, hr, employee };
}

describe("Phase 1 – Treasury Deposit", function () {
  it("Should accept a deposit and update treasuryBalance", async function () {
    const { hlusd, payStream, hr } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(1000)]);
    await payStream.write.deposit([tokens(1000)]);

    const treasury = await payStream.read.treasuryBalance();
    assert.equal(treasury, tokens(1000));
  });

  it("Should emit TreasuryDeposited event", async function () {
    const { hlusd, payStream, hr } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(500)]);

    await viem.assertions.emit(
      payStream.write.deposit([tokens(500)]),
      payStream,
      "TreasuryDeposited",
    );
  });

  it("Should revert on zero deposit", async function () {
    const { payStream } = await networkHelpers.loadFixture(deployFixture);

    await viem.assertions.revertWith(
      payStream.write.deposit([0n]),
      "PayStream: zero deposit",
    );
  });

  it("Should revert if non-owner tries to deposit", async function () {
    const { hlusd, payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await viem.assertions.revertWithCustomError(
      payStream.write.deposit([tokens(100)], { account: employee.account }),
      payStream,
      "OwnableUnauthorizedAccount",
    );
  });
});

describe("Phase 2 – Create Stream", function () {
  it("Should create a stream with correct parameters", async function () {
    const { hlusd, payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(10000)]);
    await payStream.write.deposit([tokens(10000)]);

    const rate = tokens(100) / BigInt(30 * 24 * 60 * 60);
    const taxPercent = 10n;

    await payStream.write.createStream([
      employee.account.address,
      rate,
      taxPercent,
    ]);

    const stream = await payStream.read.streams([employee.account.address]);
    assert.equal(stream[0], rate);
    assert.equal(stream[3], taxPercent);
    assert.equal(stream[4], true);
  });

  it("Should emit StreamCreated event", async function () {
    const { hlusd, payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(10000)]);
    await payStream.write.deposit([tokens(10000)]);

    const rate = tokens(100) / BigInt(30 * 24 * 60 * 60);

    await viem.assertions.emit(
      payStream.write.createStream([employee.account.address, rate, 10n]),
      payStream,
      "StreamCreated",
    );
  });

  it("Should track employee in employees array", async function () {
    const { hlusd, payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(10000)]);
    await payStream.write.deposit([tokens(10000)]);

    const rate = tokens(100) / BigInt(30 * 24 * 60 * 60);
    await payStream.write.createStream([employee.account.address, rate, 10n]);

    const count = await payStream.read.getEmployeeCount();
    assert.equal(count, 1n);
  });

  it("Should revert if stream already active for employee", async function () {
    const { hlusd, payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(10000)]);
    await payStream.write.deposit([tokens(10000)]);

    const rate = tokens(100) / BigInt(30 * 24 * 60 * 60);
    await payStream.write.createStream([employee.account.address, rate, 10n]);

    await viem.assertions.revertWith(
      payStream.write.createStream([employee.account.address, rate, 10n]),
      "PayStream: stream already active",
    );
  });

  it("Should revert if tax > 100", async function () {
    const { hlusd, payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(10000)]);
    await payStream.write.deposit([tokens(10000)]);

    const rate = tokens(100) / BigInt(30 * 24 * 60 * 60);

    await viem.assertions.revertWith(
      payStream.write.createStream([employee.account.address, rate, 101n]),
      "PayStream: tax > 100%",
    );
  });
});

describe("Phase 3 – Accrual & Withdrawal", function () {
  async function deployWithStreamFixture() {
    const { hlusd, payStream, hr, employee } = await deployFixture();

    await hlusd.write.approve([payStream.address, tokens(50000)]);
    await payStream.write.deposit([tokens(50000)]);

    const rate = 10n ** 18n;
    await payStream.write.createStream([employee.account.address, rate, 10n]);

    return { hlusd, payStream, hr, employee, rate };
  }

  it("Should accrue salary over time (time simulation)", async function () {
    const { payStream, employee } = await networkHelpers.loadFixture(
      deployWithStreamFixture,
    );

    await networkHelpers.time.increase(100);

    const accrued = await payStream.read.getAccrued([employee.account.address]);

    assert.ok(
      accrued >= tokens(100) && accrued <= tokens(102),
      `Expected ~100 tokens, got ${accrued}`,
    );
  });

  it("Should return 0 accrued if stream is paused", async function () {
    const { payStream, employee } = await networkHelpers.loadFixture(
      deployWithStreamFixture,
    );

    await payStream.write.pauseStream([employee.account.address]);

    await networkHelpers.time.increase(500);

    const accrued = await payStream.read.getAccrued([employee.account.address]);
    assert.equal(accrued, 0n);
  });

  it("Employee should withdraw with correct tax deduction", async function () {
    const { hlusd, payStream, employee } = await networkHelpers.loadFixture(
      deployWithStreamFixture,
    );

    await networkHelpers.time.increase(200);

    const balBefore = await hlusd.read.balanceOf([employee.account.address]);

    await payStream.write.withdraw({ account: employee.account });

    const balAfter = await hlusd.read.balanceOf([employee.account.address]);
    const received = balAfter - balBefore;

    assert.ok(
      received >= tokens(180) && received <= tokens(183),
      `Expected ~180 net, got ${received}`,
    );

    const taxVault = await payStream.read.taxVaultBalance();
    assert.ok(
      taxVault >= tokens(20) && taxVault <= tokens(21),
      `Expected ~20 tax, got ${taxVault}`,
    );
  });

  it("Should emit Withdrawn event on withdraw", async function () {
    const { payStream, employee } = await networkHelpers.loadFixture(
      deployWithStreamFixture,
    );

    await networkHelpers.time.increase(50);

    await viem.assertions.emit(
      payStream.write.withdraw({ account: employee.account }),
      payStream,
      "Withdrawn",
    );
  });

  it("Should revert withdraw if no active stream", async function () {
    const { payStream, hr } = await networkHelpers.loadFixture(
      deployWithStreamFixture,
    );

    await viem.assertions.revertWith(
      payStream.write.withdraw({ account: hr.account }),
      "PayStream: no active stream",
    );
  });
});

describe("Phase 3 – Pause / Resume / Cancel", function () {
  async function deployWithStreamFixture() {
    const { hlusd, payStream, hr, employee } = await deployFixture();

    await hlusd.write.approve([payStream.address, tokens(50000)]);
    await payStream.write.deposit([tokens(50000)]);

    const rate = 10n ** 18n;
    await payStream.write.createStream([employee.account.address, rate, 10n]);

    return { hlusd, payStream, hr, employee, rate };
  }

  it("Pause should settle accrued salary and stop future accrual", async function () {
    const { hlusd, payStream, employee } = await networkHelpers.loadFixture(
      deployWithStreamFixture,
    );

    await networkHelpers.time.increase(100);

    const balBefore = await hlusd.read.balanceOf([employee.account.address]);

    await payStream.write.pauseStream([employee.account.address]);

    const balAfter = await hlusd.read.balanceOf([employee.account.address]);
    const received = balAfter - balBefore;

    assert.ok(received > 0n, "Employee should have received settlement");

    const stream = await payStream.read.streams([employee.account.address]);
    assert.equal(stream[4], false);

    await networkHelpers.time.increase(500);
    const accrued = await payStream.read.getAccrued([employee.account.address]);
    assert.equal(accrued, 0n);
  });

  it("Resume should restart accrual from current time", async function () {
    const { payStream, employee } = await networkHelpers.loadFixture(
      deployWithStreamFixture,
    );

    await payStream.write.pauseStream([employee.account.address]);

    await networkHelpers.time.increase(200);

    await payStream.write.resumeStream([employee.account.address]);

    const stream = await payStream.read.streams([employee.account.address]);
    assert.equal(stream[4], true);

    await networkHelpers.time.increase(50);

    const accrued = await payStream.read.getAccrued([employee.account.address]);
    assert.ok(
      accrued >= tokens(50) && accrued <= tokens(52),
      `Expected ~50 after resume, got ${accrued}`,
    );
  });

  it("Cancel should pay remaining and delete stream", async function () {
    const { hlusd, payStream, employee } = await networkHelpers.loadFixture(
      deployWithStreamFixture,
    );

    await networkHelpers.time.increase(100);

    const balBefore = await hlusd.read.balanceOf([employee.account.address]);

    await payStream.write.cancelStream([employee.account.address]);

    const balAfter = await hlusd.read.balanceOf([employee.account.address]);
    assert.ok(balAfter > balBefore, "Employee should receive final payout");

    const stream = await payStream.read.streams([employee.account.address]);
    assert.equal(stream[1], 0n);
    assert.equal(stream[4], false);
  });

  it("Should revert resumeStream on already-active stream", async function () {
    const { payStream, employee } = await networkHelpers.loadFixture(
      deployWithStreamFixture,
    );

    await viem.assertions.revertWith(
      payStream.write.resumeStream([employee.account.address]),
      "PayStream: already active",
    );
  });

  it("Should revert pauseStream on already-paused stream", async function () {
    const { payStream, employee } = await networkHelpers.loadFixture(
      deployWithStreamFixture,
    );

    await payStream.write.pauseStream([employee.account.address]);

    await viem.assertions.revertWith(
      payStream.write.pauseStream([employee.account.address]),
      "PayStream: already paused",
    );
  });
});

describe("Bonus", function () {
  it("Should transfer bonus from treasury to employee", async function () {
    const { hlusd, payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(5000)]);
    await payStream.write.deposit([tokens(5000)]);

    const balBefore = await hlusd.read.balanceOf([employee.account.address]);

    await payStream.write.triggerBonus([employee.account.address, tokens(250)]);

    const balAfter = await hlusd.read.balanceOf([employee.account.address]);
    assert.equal(balAfter - balBefore, tokens(250));

    const treasury = await payStream.read.treasuryBalance();
    assert.equal(treasury, tokens(4750));
  });

  it("Should emit BonusSent event", async function () {
    const { hlusd, payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(5000)]);
    await payStream.write.deposit([tokens(5000)]);

    await viem.assertions.emit(
      payStream.write.triggerBonus([employee.account.address, tokens(100)]),
      payStream,
      "BonusSent",
    );
  });

  it("Should revert bonus if treasury too low", async function () {
    const { hlusd, payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(50)]);
    await payStream.write.deposit([tokens(50)]);

    await viem.assertions.revertWith(
      payStream.write.triggerBonus([employee.account.address, tokens(100)]),
      "PayStream: treasury low",
    );
  });
});

describe("Simulated Yield", function () {
  it("Should add yield to treasury", async function () {
    const { hlusd, payStream } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(1000)]);
    await payStream.write.deposit([tokens(1000)]);

    await hlusd.write.approve([payStream.address, tokens(100)]);
    await payStream.write.simulateYield([tokens(100)]);

    const treasury = await payStream.read.treasuryBalance();
    assert.equal(treasury, tokens(1100));
  });

  it("Should emit YieldSimulated event", async function () {
    const { hlusd, payStream } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(100)]);

    await viem.assertions.emit(
      payStream.write.simulateYield([tokens(100)]),
      payStream,
      "YieldSimulated",
    );
  });
});

describe("Tax Vault", function () {
  it("HR should withdraw accumulated tax", async function () {
    const { hlusd, payStream, hr, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(50000)]);
    await payStream.write.deposit([tokens(50000)]);

    const rate = 10n ** 18n;
    await payStream.write.createStream([employee.account.address, rate, 10n]);

    await networkHelpers.time.increase(1000);
    await payStream.write.withdraw({ account: employee.account });

    const taxBefore = await payStream.read.taxVaultBalance();
    assert.ok(taxBefore > 0n, "Tax vault should have value");

    const hrBalBefore = await hlusd.read.balanceOf([hr.account.address]);
    await payStream.write.withdrawTax();
    const hrBalAfter = await hlusd.read.balanceOf([hr.account.address]);

    assert.ok(hrBalAfter > hrBalBefore, "HR should receive tax");

    const taxAfter = await payStream.read.taxVaultBalance();
    assert.equal(taxAfter, 0n);
  });

  it("Should revert if no tax to withdraw", async function () {
    const { payStream } = await networkHelpers.loadFixture(deployFixture);

    await viem.assertions.revertWith(
      payStream.write.withdrawTax(),
      "PayStream: no tax to withdraw",
    );
  });
});

describe("Access Control", function () {
  it("Non-owner should not be able to create a stream", async function () {
    const { hlusd, payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await viem.assertions.revertWithCustomError(
      payStream.write.createStream(
        [employee.account.address, 10n ** 18n, 10n],
        { account: employee.account },
      ),
      payStream,
      "OwnableUnauthorizedAccount",
    );
  });

  it("Non-owner should not be able to pause a stream", async function () {
    const { hlusd, payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await hlusd.write.approve([payStream.address, tokens(10000)]);
    await payStream.write.deposit([tokens(10000)]);
    await payStream.write.createStream([
      employee.account.address,
      10n ** 18n,
      10n,
    ]);

    await viem.assertions.revertWithCustomError(
      payStream.write.pauseStream([employee.account.address], {
        account: employee.account,
      }),
      payStream,
      "OwnableUnauthorizedAccount",
    );
  });

  it("Non-owner should not be able to trigger bonus", async function () {
    const { payStream, employee } =
      await networkHelpers.loadFixture(deployFixture);

    await viem.assertions.revertWithCustomError(
      payStream.write.triggerBonus([employee.account.address, tokens(100)], {
        account: employee.account,
      }),
      payStream,
      "OwnableUnauthorizedAccount",
    );
  });
});
