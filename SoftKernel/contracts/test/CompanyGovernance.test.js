const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Multi-Company Governance Test Suite
 *
 * Covers:
 * - Company creation
 * - CEO assignment & multi-CEO
 * - HR assignment
 * - Employee management
 * - Role restriction enforcement
 * - Stream creation under company scope
 * - Cross-company isolation
 * - Cannot create stream under wrong company
 * - Pause / Resume / Cancel under governance
 * - Withdraw as employee
 * - Company stats & analytics
 */
describe("PayStream v2 – Multi-Company Governance", function () {
  let treasury, salaryStream;
  let deployer, ceo, hr, emp1, emp2, outsider, taxVault, ceo2;

  const SECONDS_PER_MONTH = 30 * 24 * 60 * 60;
  const MONTHLY = ethers.parseEther("10"); // 10 HLUSD/month
  const DEPOSIT = ethers.parseEther("1000");

  beforeEach(async function () {
    [deployer, ceo, hr, emp1, emp2, outsider, taxVault, ceo2] =
      await ethers.getSigners();

    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy();
    await treasury.waitForDeployment();

    const SalaryStream = await ethers.getContractFactory("SalaryStream");
    salaryStream = await SalaryStream.deploy(
      await treasury.getAddress(),
      taxVault.address
    );
    await salaryStream.waitForDeployment();

    await treasury.setSalaryStream(await salaryStream.getAddress());
  });

  // ================================================================
  //                     COMPANY CREATION
  // ================================================================
  describe("Company Creation", function () {
    it("Should create a company and assign creator as CEO", async function () {
      const tx = await salaryStream.connect(ceo).createCompany("Acme Corp");
      await expect(tx)
        .to.emit(salaryStream, "CompanyCreated")
        .withArgs(1, "Acme Corp", ceo.address);

      const [name, creator, createdAt, exists] =
        await salaryStream.getCompany(1);
      expect(name).to.equal("Acme Corp");
      expect(creator).to.equal(ceo.address);
      expect(exists).to.be.true;

      // Creator should have CEO role
      expect(await salaryStream.companyRoles(1, ceo.address)).to.equal(2); // CEO=2
    });

    it("Should increment companyCounter", async function () {
      await salaryStream.connect(ceo).createCompany("A");
      await salaryStream.connect(ceo).createCompany("B");
      expect(await salaryStream.companyCounter()).to.equal(2);
    });

    it("Should revert on empty name", async function () {
      await expect(
        salaryStream.connect(ceo).createCompany("")
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should track user companies", async function () {
      await salaryStream.connect(ceo).createCompany("X");
      await salaryStream.connect(ceo).createCompany("Y");
      const ids = await salaryStream.getUserCompanies(ceo.address);
      expect(ids.length).to.equal(2);
      expect(ids[0]).to.equal(1);
      expect(ids[1]).to.equal(2);
    });
  });

  // ================================================================
  //                     ROLE MANAGEMENT (CEO)
  // ================================================================
  describe("CEO Role Management", function () {
    beforeEach(async function () {
      await salaryStream.connect(ceo).createCompany("TestCo");
    });

    it("CEO can add another CEO", async function () {
      await expect(salaryStream.connect(ceo).addCEO(1, ceo2.address))
        .to.emit(salaryStream, "RoleAssigned")
        .withArgs(1, ceo2.address, 2);
      expect(await salaryStream.companyRoles(1, ceo2.address)).to.equal(2);
    });

    it("CEO can remove another CEO", async function () {
      await salaryStream.connect(ceo).addCEO(1, ceo2.address);
      await expect(salaryStream.connect(ceo).removeCEO(1, ceo2.address))
        .to.emit(salaryStream, "RoleRevoked")
        .withArgs(1, ceo2.address, 2);
      expect(await salaryStream.companyRoles(1, ceo2.address)).to.equal(0);
    });

    it("Cannot remove the last CEO", async function () {
      await expect(
        salaryStream.connect(ceo).removeCEO(1, ceo.address)
      ).to.be.revertedWith("Cannot remove last CEO");
    });

    it("Can remove self if another CEO exists", async function () {
      await salaryStream.connect(ceo).addCEO(1, ceo2.address);
      await salaryStream.connect(ceo).removeCEO(1, ceo.address);
      expect(await salaryStream.companyRoles(1, ceo.address)).to.equal(0);
    });

    it("Non-CEO cannot add CEO", async function () {
      await expect(
        salaryStream.connect(outsider).addCEO(1, outsider.address)
      ).to.be.revertedWith("Not CEO");
    });

    it("Cannot add duplicate CEO", async function () {
      await expect(
        salaryStream.connect(ceo).addCEO(1, ceo.address)
      ).to.be.revertedWith("Already CEO");
    });
  });

  // ================================================================
  //                     HR ROLE MANAGEMENT
  // ================================================================
  describe("HR Role Management", function () {
    beforeEach(async function () {
      await salaryStream.connect(ceo).createCompany("HRCo");
    });

    it("CEO can add HR", async function () {
      await expect(salaryStream.connect(ceo).addHR(1, hr.address))
        .to.emit(salaryStream, "RoleAssigned")
        .withArgs(1, hr.address, 1); // HR=1
      expect(await salaryStream.companyRoles(1, hr.address)).to.equal(1);
    });

    it("CEO can remove HR", async function () {
      await salaryStream.connect(ceo).addHR(1, hr.address);
      await expect(salaryStream.connect(ceo).removeHR(1, hr.address))
        .to.emit(salaryStream, "RoleRevoked");
      expect(await salaryStream.companyRoles(1, hr.address)).to.equal(0);
    });

    it("HR cannot add another HR", async function () {
      await salaryStream.connect(ceo).addHR(1, hr.address);
      await expect(
        salaryStream.connect(hr).addHR(1, outsider.address)
      ).to.be.revertedWith("Not CEO");
    });

    it("Cannot add role to someone who already has a role", async function () {
      await salaryStream.connect(ceo).addHR(1, hr.address);
      await expect(
        salaryStream.connect(ceo).addHR(1, hr.address)
      ).to.be.revertedWith("Already has role");
    });
  });

  // ================================================================
  //                     EMPLOYEE MANAGEMENT
  // ================================================================
  describe("Employee Management", function () {
    beforeEach(async function () {
      await salaryStream.connect(ceo).createCompany("EmpCo");
      await salaryStream.connect(ceo).addHR(1, hr.address);
    });

    it("HR can add employee", async function () {
      await expect(salaryStream.connect(hr).addEmployee(1, emp1.address))
        .to.emit(salaryStream, "EmployeeAdded")
        .withArgs(1, emp1.address);
      expect(await salaryStream.isCompanyEmployee(1, emp1.address)).to.be.true;
    });

    it("CEO can add employee", async function () {
      await salaryStream.connect(ceo).addEmployee(1, emp1.address);
      expect(await salaryStream.isCompanyEmployee(1, emp1.address)).to.be.true;
    });

    it("Cannot add duplicate employee", async function () {
      await salaryStream.connect(ceo).addEmployee(1, emp1.address);
      await expect(
        salaryStream.connect(ceo).addEmployee(1, emp1.address)
      ).to.be.revertedWith("Already an employee");
    });

    it("CEO can remove employee", async function () {
      await salaryStream.connect(ceo).addEmployee(1, emp1.address);
      await expect(salaryStream.connect(ceo).removeEmployee(1, emp1.address))
        .to.emit(salaryStream, "EmployeeRemoved")
        .withArgs(1, emp1.address);
      expect(await salaryStream.isCompanyEmployee(1, emp1.address)).to.be.false;
    });

    it("HR cannot remove employee (CEO only)", async function () {
      await salaryStream.connect(ceo).addEmployee(1, emp1.address);
      await expect(
        salaryStream.connect(hr).removeEmployee(1, emp1.address)
      ).to.be.revertedWith("Not CEO");
    });

    it("Outsider cannot add employee", async function () {
      await expect(
        salaryStream.connect(outsider).addEmployee(1, emp1.address)
      ).to.be.revertedWith("Not HR or CEO");
    });

    it("getCompanyEmployees returns correct list", async function () {
      await salaryStream.connect(ceo).addEmployee(1, emp1.address);
      await salaryStream.connect(ceo).addEmployee(1, emp2.address);
      const emps = await salaryStream.getCompanyEmployees(1);
      expect(emps.length).to.equal(2);
    });
  });

  // ================================================================
  //                STREAM CREATION UNDER COMPANY
  // ================================================================
  describe("Stream Creation (Company-Scoped)", function () {
    beforeEach(async function () {
      await salaryStream.connect(ceo).createCompany("StreamCo");
      await salaryStream.connect(ceo).addHR(1, hr.address);
      await salaryStream.connect(ceo).addEmployee(1, emp1.address);
      // CEO deposits funds to treasury
      await treasury.connect(ceo).deposit({ value: DEPOSIT });
    });

    it("HR can create stream for company employee", async function () {
      const tx = await salaryStream
        .connect(hr)
        .createStream(1, emp1.address, MONTHLY, 12, 10);
      await expect(tx).to.emit(salaryStream, "StreamCreatedCompany");

      const stream = await salaryStream.getStreamDetails(emp1.address);
      expect(stream.exists).to.be.true;
      expect(stream.companyId).to.equal(1);
      expect(stream.employer).to.equal(ceo.address); // company creator
      expect(stream.monthlySalary).to.equal(MONTHLY);
      expect(stream.taxPercent).to.equal(10);
    });

    it("CEO can create stream", async function () {
      await salaryStream
        .connect(ceo)
        .createStream(1, emp1.address, MONTHLY, 6, 5);
      const stream = await salaryStream.getStreamDetails(emp1.address);
      expect(stream.exists).to.be.true;
    });

    it("Cannot create stream for non-company employee", async function () {
      await expect(
        salaryStream
          .connect(ceo)
          .createStream(1, emp2.address, MONTHLY, 12, 10)
      ).to.be.revertedWith("Not company employee");
    });

    it("Cannot create duplicate stream for same employee", async function () {
      await salaryStream
        .connect(ceo)
        .createStream(1, emp1.address, MONTHLY, 12, 10);
      await expect(
        salaryStream
          .connect(ceo)
          .createStream(1, emp1.address, MONTHLY, 12, 10)
      ).to.be.revertedWith("Stream exists");
    });

    it("Outsider cannot create stream", async function () {
      await expect(
        salaryStream
          .connect(outsider)
          .createStream(1, emp1.address, MONTHLY, 12, 10)
      ).to.be.revertedWith("Not HR or CEO");
    });

    it("Reserves funds in treasury under company creator", async function () {
      const totalSalary = MONTHLY * 12n;
      await salaryStream
        .connect(ceo)
        .createStream(1, emp1.address, MONTHLY, 12, 10);
      const reserved = await treasury.employerReserved(ceo.address);
      expect(reserved).to.equal(totalSalary);
    });

    it("Fails if insufficient treasury balance", async function () {
      await salaryStream.connect(ceo).addEmployee(1, emp2.address);
      await expect(
        salaryStream
          .connect(ceo)
          .createStream(1, emp2.address, ethers.parseEther("99999"), 12, 10)
      ).to.be.reverted;
    });
  });

  // ================================================================
  //                   CROSS-COMPANY ISOLATION
  // ================================================================
  describe("Cross-Company Isolation", function () {
    beforeEach(async function () {
      // Company 1 by ceo
      await salaryStream.connect(ceo).createCompany("Company A");
      await salaryStream.connect(ceo).addEmployee(1, emp1.address);

      // Company 2 by ceo2
      await salaryStream.connect(ceo2).createCompany("Company B");
      await salaryStream.connect(ceo2).addEmployee(2, emp2.address);

      await treasury.connect(ceo).deposit({ value: DEPOSIT });
      await treasury.connect(ceo2).deposit({ value: DEPOSIT });
    });

    it("Cannot create stream on another company's employee", async function () {
      // emp2 belongs to company 2 — ceo of company 1 tries to create for emp2 under company 1
      await expect(
        salaryStream
          .connect(ceo)
          .createStream(1, emp2.address, MONTHLY, 12, 10)
      ).to.be.revertedWith("Not company employee");
    });

    it("CEO of company 1 cannot manage company 2", async function () {
      await expect(
        salaryStream.connect(ceo).addEmployee(2, emp1.address)
      ).to.be.revertedWith("Not HR or CEO");
    });

    it("HR of company 1 cannot manage company 2 streams", async function () {
      await salaryStream.connect(ceo).addHR(1, hr.address);
      await expect(
        salaryStream
          .connect(hr)
          .createStream(2, emp2.address, MONTHLY, 12, 10)
      ).to.be.revertedWith("Not HR or CEO");
    });

    it("Each company tracks its own employees", async function () {
      const empsA = await salaryStream.getCompanyEmployees(1);
      const empsB = await salaryStream.getCompanyEmployees(2);
      expect(empsA.length).to.equal(1);
      expect(empsB.length).to.equal(1);
      expect(empsA[0]).to.equal(emp1.address);
      expect(empsB[0]).to.equal(emp2.address);
    });
  });

  // ================================================================
  //                   STREAM PAUSE / RESUME / CANCEL
  // ================================================================
  describe("Stream Operations (Governance)", function () {
    beforeEach(async function () {
      await salaryStream.connect(ceo).createCompany("OpsCo");
      await salaryStream.connect(ceo).addHR(1, hr.address);
      await salaryStream.connect(ceo).addEmployee(1, emp1.address);
      await treasury.connect(ceo).deposit({ value: DEPOSIT });
      await salaryStream
        .connect(hr)
        .createStream(1, emp1.address, MONTHLY, 12, 10);
    });

    it("HR can pause stream", async function () {
      await expect(salaryStream.connect(hr).pauseStream(emp1.address))
        .to.emit(salaryStream, "StreamPaused")
        .withArgs(emp1.address);
    });

    it("HR can resume stream", async function () {
      await salaryStream.connect(hr).pauseStream(emp1.address);
      await expect(salaryStream.connect(hr).resumeStream(emp1.address))
        .to.emit(salaryStream, "StreamResumed")
        .withArgs(emp1.address);
    });

    it("CEO can cancel stream", async function () {
      await expect(salaryStream.connect(ceo).cancelStream(emp1.address))
        .to.emit(salaryStream, "StreamCancelled");
    });

    it("Outsider cannot pause", async function () {
      await expect(
        salaryStream.connect(outsider).pauseStream(emp1.address)
      ).to.be.revertedWith("Not HR or CEO");
    });

    it("Outsider cannot cancel", async function () {
      await expect(
        salaryStream.connect(outsider).cancelStream(emp1.address)
      ).to.be.revertedWith("Not HR or CEO");
    });

    it("Cannot remove employee with active stream", async function () {
      await expect(
        salaryStream.connect(ceo).removeEmployee(1, emp1.address)
      ).to.be.revertedWith("Active stream exists");
    });

    it("Can remove employee after cancelling stream", async function () {
      await salaryStream.connect(ceo).cancelStream(emp1.address);
      await salaryStream.connect(ceo).removeEmployee(1, emp1.address);
      expect(await salaryStream.isCompanyEmployee(1, emp1.address)).to.be
        .false;
    });
  });

  // ================================================================
  //                     EMPLOYEE WITHDRAW
  // ================================================================
  describe("Employee Withdraw", function () {
    beforeEach(async function () {
      await salaryStream.connect(ceo).createCompany("PayCo");
      await salaryStream.connect(ceo).addEmployee(1, emp1.address);
      await treasury.connect(ceo).deposit({ value: DEPOSIT });
      await salaryStream
        .connect(ceo)
        .createStream(1, emp1.address, MONTHLY, 12, 10);
    });

    it("Employee can withdraw earned salary", async function () {
      // Advance 30 days
      await time.increase(SECONDS_PER_MONTH);

      const balBefore = await ethers.provider.getBalance(emp1.address);
      const tx = await salaryStream.connect(emp1).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balAfter = await ethers.provider.getBalance(emp1.address);

      // Net = MONTHLY * 90% (10% tax)
      const expected = (MONTHLY * 90n) / 100n;
      const diff = balAfter - balBefore + gasUsed;
      // Allow some rounding tolerance due to per-second calc
      expect(diff).to.be.closeTo(expected, ethers.parseEther("0.1"));
    });

    it("Non-employee cannot withdraw", async function () {
      await expect(
        salaryStream.connect(outsider).withdraw()
      ).to.be.revertedWith("Stream not found");
    });

    it("Cannot withdraw when paused", async function () {
      await salaryStream.connect(ceo).pauseStream(emp1.address);
      await expect(
        salaryStream.connect(emp1).withdraw()
      ).to.be.revertedWith("Stream paused");
    });

    it("Updates company paid stats on withdraw", async function () {
      await time.increase(SECONDS_PER_MONTH);
      await salaryStream.connect(emp1).withdraw();
      const [, , , totalPaid] = await salaryStream.getCompanyStats(1);
      expect(totalPaid).to.be.gt(0);
    });
  });

  // ================================================================
  //                     COMPANY ANALYTICS
  // ================================================================
  describe("Company Analytics", function () {
    beforeEach(async function () {
      await salaryStream.connect(ceo).createCompany("StatsCo");
      await salaryStream.connect(ceo).addEmployee(1, emp1.address);
      await salaryStream.connect(ceo).addEmployee(1, emp2.address);
      await treasury.connect(ceo).deposit({ value: DEPOSIT });
      await salaryStream
        .connect(ceo)
        .createStream(1, emp1.address, MONTHLY, 12, 10);
    });

    it("getCompanyStats returns correct counts", async function () {
      const [totalEmps, active, reserved, paid] =
        await salaryStream.getCompanyStats(1);
      expect(totalEmps).to.equal(2);
      expect(active).to.equal(1);
      expect(reserved).to.equal(MONTHLY * 12n);
      expect(paid).to.equal(0);
    });

    it("getCompanyRoles returns CEO", async function () {
      const [members, roles] = await salaryStream.getCompanyRoles(1);
      expect(members.length).to.equal(1);
      expect(members[0]).to.equal(ceo.address);
      expect(roles[0]).to.equal(2); // CEO
    });

    it("getCompanyRoles shows HR after adding", async function () {
      await salaryStream.connect(ceo).addHR(1, hr.address);
      const [members, roles] = await salaryStream.getCompanyRoles(1);
      expect(members.length).to.equal(2);
    });

    it("getEmployeeCompany returns correct company", async function () {
      const [companyId, found] = await salaryStream.getEmployeeCompany(
        emp1.address
      );
      expect(found).to.be.true;
      expect(companyId).to.equal(1);
    });

    it("getEmployeeCompany returns false for non-stream employee", async function () {
      const [, found] = await salaryStream.getEmployeeCompany(outsider.address);
      expect(found).to.be.false;
    });

    it("getCompanyStreamEmployees lists stream employees", async function () {
      const emps = await salaryStream.getCompanyStreamEmployees(1);
      expect(emps.length).to.equal(1);
      expect(emps[0]).to.equal(emp1.address);
    });
  });

  // ================================================================
  //                     COMPANY NAME UPDATE
  // ================================================================
  describe("Company Metadata", function () {
    beforeEach(async function () {
      await salaryStream.connect(ceo).createCompany("OldName");
    });

    it("CEO can update company name", async function () {
      await expect(
        salaryStream.connect(ceo).updateCompanyName(1, "NewName")
      )
        .to.emit(salaryStream, "CompanyNameUpdated")
        .withArgs(1, "NewName");
      const [name] = await salaryStream.getCompany(1);
      expect(name).to.equal("NewName");
    });

    it("Non-CEO cannot update name", async function () {
      await expect(
        salaryStream.connect(outsider).updateCompanyName(1, "Hacked")
      ).to.be.revertedWith("Not CEO");
    });

    it("Cannot set empty name", async function () {
      await expect(
        salaryStream.connect(ceo).updateCompanyName(1, "")
      ).to.be.revertedWith("Name cannot be empty");
    });
  });

  // ================================================================
  //                     BONUS UNDER GOVERNANCE
  // ================================================================
  describe("Bonus (Company-Scoped)", function () {
    beforeEach(async function () {
      await salaryStream.connect(ceo).createCompany("BonusCo");
      await salaryStream.connect(ceo).addHR(1, hr.address);
      await salaryStream.connect(ceo).addEmployee(1, emp1.address);
      await treasury.connect(ceo).deposit({ value: DEPOSIT });
      await salaryStream
        .connect(ceo)
        .createStream(1, emp1.address, MONTHLY, 12, 10);
    });

    it("HR can schedule bonus", async function () {
      const unlockTime = (await time.latest()) + 3600;
      await expect(
        salaryStream
          .connect(hr)
          .scheduleBonus(emp1.address, ethers.parseEther("1"), unlockTime)
      ).to.emit(salaryStream, "BonusScheduled");
    });

    it("Outsider cannot schedule bonus", async function () {
      const unlockTime = (await time.latest()) + 3600;
      await expect(
        salaryStream
          .connect(outsider)
          .scheduleBonus(emp1.address, ethers.parseEther("1"), unlockTime)
      ).to.be.revertedWith("Not HR or CEO");
    });
  });

  // ================================================================
  //               INTEGRATION: FULL COMPANY LIFECYCLE
  // ================================================================
  describe("Full Lifecycle Integration", function () {
    it("Complete company lifecycle works end-to-end", async function () {
      // 1. Create company
      await salaryStream.connect(ceo).createCompany("LifeCycleCo");

      // 2. Add HR
      await salaryStream.connect(ceo).addHR(1, hr.address);

      // 3. CEO deposits to treasury
      await treasury.connect(ceo).deposit({ value: DEPOSIT });

      // 4. HR adds employees
      await salaryStream.connect(hr).addEmployee(1, emp1.address);
      await salaryStream.connect(hr).addEmployee(1, emp2.address);

      // 5. HR creates streams
      await salaryStream
        .connect(hr)
        .createStream(1, emp1.address, MONTHLY, 12, 10);
      await salaryStream
        .connect(hr)
        .createStream(1, emp2.address, MONTHLY, 6, 5);

      // 6. Time passes
      await time.increase(SECONDS_PER_MONTH);

      // 7. Employees withdraw
      await salaryStream.connect(emp1).withdraw();
      await salaryStream.connect(emp2).withdraw();

      // 8. Check stats
      const [totalEmps, activeStreams, reserved, paid] =
        await salaryStream.getCompanyStats(1);
      expect(totalEmps).to.equal(2);
      expect(activeStreams).to.equal(2);
      expect(paid).to.be.gt(0);

      // 9. Cancel one stream
      await salaryStream.connect(ceo).cancelStream(emp2.address);

      // 10. Remove employee after cancel
      await salaryStream.connect(ceo).removeEmployee(1, emp2.address);

      const emps = await salaryStream.getCompanyEmployees(1);
      expect(emps.length).to.equal(1);
    });
  });
});
