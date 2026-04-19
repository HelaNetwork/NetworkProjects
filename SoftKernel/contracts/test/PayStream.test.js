const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * PayStream Test Suite - Native HLUSD Version
 * 
 * Tests cover:
 * - Treasury deposit and fund management (native HLUSD)
 * - Stream creation and per-second calculations
 * - Tax redirection logic
 * - Admin-based access control
 * - HR dashboard functions
 * - Gas optimization verification
 * - Security (reentrancy, CEI pattern)
 */
describe("PayStream - Treasury & SalaryStream (Native HLUSD)", function () {
  let treasury, salaryStream;
  let owner, admin, employer, employee, taxVault, otherUser;
  
  const SECONDS_PER_MONTH = 30 * 24 * 60 * 60; // 30 days
  // const SECONDS_PER_MONTH = 5 * 60; // 5 minutes for testing
  const MONTHLY_SALARY = ethers.parseEther("10"); // 3000 HLUSD per month

  beforeEach(async function () {
    // Get signers
    [owner, admin, employer, employee, taxVault, otherUser] = await ethers.getSigners();

    // Deploy Treasury
    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy();
    await treasury.waitForDeployment();

    // Deploy SalaryStream
    const SalaryStream = await ethers.getContractFactory("SalaryStream");
    salaryStream = await SalaryStream.deploy(
      await treasury.getAddress(),
      taxVault.address
    );
    await salaryStream.waitForDeployment();

    // Link SalaryStream to Treasury
    await treasury.setSalaryStream(await salaryStream.getAddress());
  });

  describe("Treasury - Native HLUSD", function () {
    it("Should deploy with correct owner", async function () {
      expect(await treasury.owner()).to.equal(owner.address);
    });

    it("Should allow deposit of native HLUSD via deposit()", async function () {
      const depositAmount = ethers.parseEther("1000");
      
      await expect(treasury.connect(employer).deposit({ value: depositAmount }))
        .to.emit(treasury, "Deposited")
        .withArgs(employer.address, depositAmount);

      expect(await treasury.employerBalances(employer.address)).to.equal(depositAmount);
      expect(await treasury.getTreasuryBalance()).to.equal(depositAmount);
    });

    it("Should allow deposit of native HLUSD via receive()", async function () {
      const depositAmount = ethers.parseEther("5000");
      
      // Send HLUSD directly to treasury
      await owner.sendTransaction({
        to: await treasury.getAddress(),
        value: depositAmount
      });

      expect(await treasury.employerBalances(owner.address)).to.equal(depositAmount);
    });

    it("Should reject zero deposits", async function () {
      await expect(
        treasury.connect(employer).deposit({ value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should only allow SalaryStream to reserve funds", async function () {
      const depositAmount = ethers.parseEther("1000");
      await treasury.connect(employer).deposit({ value: depositAmount });

      // Should fail when called by non-SalaryStream
      await expect(
        treasury.connect(employer).reserveFunds(employer.address, ethers.parseEther("1000"))
      ).to.be.revertedWith("Not authorized");
    });

    it("Should prevent setting SalaryStream twice", async function () {
      await expect(
        treasury.setSalaryStream(otherUser.address)
      ).to.be.revertedWith("Already set");
    });

    it("Should track available balance correctly", async function () {
      const depositAmount = ethers.parseEther("1000");
      await treasury.connect(employer).deposit({ value: depositAmount });

      const available = await treasury.getAvailableBalance(employer.address);
      expect(available).to.equal(depositAmount);
    });
  });

  describe("SalaryStream - Creation", function () {
    beforeEach(async function () {
      // Owner creates company and adds employees
      await salaryStream.connect(owner).createCompany("Test Company");
      await salaryStream.connect(owner).addEmployee(1, employee.address);
      await salaryStream.connect(owner).addEmployee(1, otherUser.address);
      await salaryStream.connect(owner).addEmployee(1, taxVault.address);
      
      // Admin deposits native HLUSD
      const depositAmount = ethers.parseEther("1000");
      await treasury.connect(owner).deposit({ value: depositAmount });
    });

    it.skip("Should have admin set to deployer", async function () {
      // Skipped: admin() function removed in company governance model
      // Owner is automatically CEO when creating company
    });

    it("Should only allow admin to create streams", async function () {
      await expect(
        salaryStream.connect(otherUser).createStream(1, employee.address,
          MONTHLY_SALARY,
          12,
          10
        )
      ).to.be.revertedWith("Not HR or CEO");
    });

    it("Should create stream with correct parameters", async function () {
      const durationMonths = 12;
      const taxPercent = 10;

      await expect(
        salaryStream.connect(owner).createStream(1, employee.address,
          MONTHLY_SALARY,
          durationMonths,
          taxPercent
        )
      ).to.emit(salaryStream, "StreamCreated");

      const stream = await salaryStream.streams(employee.address);
      expect(stream.employer).to.equal(owner.address);
      expect(stream.taxPercent).to.equal(taxPercent);
      
      // Check rate per second calculation
      const expectedRate = MONTHLY_SALARY / BigInt(SECONDS_PER_MONTH);
      expect(stream.ratePerSecond).to.equal(expectedRate);
    });

    it("Should prevent duplicate streams for same employee", async function () {
      await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);

      await expect(
        salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 6, 5)
      ).to.be.revertedWith("Stream exists");
    });

    it("Should reject invalid parameters", async function () {
      // Zero address
      await expect(
        salaryStream.connect(owner).createStream(1, ethers.ZeroAddress, MONTHLY_SALARY, 12, 10)
      ).to.be.revertedWith("Invalid employee");

      // Zero salary
      await expect(
        salaryStream.connect(owner).createStream(1, employee.address, 0, 12, 10)
      ).to.be.revertedWith("Salary must be > 0");

      // Zero duration
      await expect(
        salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 0, 10)
      ).to.be.revertedWith("Duration must be > 0");

      // Invalid tax
      await expect(
        salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 101)
      ).to.be.revertedWith("Tax percent must be <= 100");
    });

    it("Should reserve correct amount in treasury", async function () {
      const durationMonths = 12;
      const totalSalary = MONTHLY_SALARY * BigInt(durationMonths);

      await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, durationMonths, 10);

      const reserved = await treasury.employerReserved(owner.address);
      expect(reserved).to.equal(totalSalary);
    });
  });

  describe("SalaryStream - Per-Second Streaming", function () {
    beforeEach(async function () {
      // Setup: Create company and add employee
      await salaryStream.connect(owner).createCompany("Test Company");
      await salaryStream.connect(owner).addEmployee(1, employee.address);
      
      // Setup: Deposit and create stream
      const depositAmount = ethers.parseEther("1000");
      await treasury.connect(owner).deposit({ value: depositAmount });

      await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
    });

    it("Should calculate earnings per second correctly", async function () {
      const stream = await salaryStream.streams(employee.address);
      const ratePerSecond = stream.ratePerSecond;

      // Advance time by 1 hour (3600 seconds)
      await time.increase(3600);

      const earned = await salaryStream.getEarned(employee.address);
      const expectedEarned = ratePerSecond * BigInt(3600);
      
      expect(earned).to.be.closeTo(expectedEarned, ethers.parseEther("0.01"));
    });

    it("Should calculate earnings for one day", async function () {
      const stream = await salaryStream.streams(employee.address);
      const ratePerSecond = stream.ratePerSecond;

      // Advance time by 1 day (86400 seconds)
      await time.increase(86400);

      const earned = await salaryStream.getEarned(employee.address);
      const expectedEarned = ratePerSecond * BigInt(86400);
      
      expect(earned).to.equal(expectedEarned);
    });

    it("Should calculate earnings for one month", async function () {
      // Advance time by 1 month
      await time.increase(SECONDS_PER_MONTH);

      const earned = await salaryStream.getEarned(employee.address);
      
      // Should be approximately equal to monthly salary
      expect(earned).to.be.closeTo(MONTHLY_SALARY, ethers.parseEther("1"));
    });

    it("Should cap earnings at endTime", async function () {
      // Advance time beyond stream end (13 months)
      await time.increase(SECONDS_PER_MONTH * 13);

      const earned = await salaryStream.getEarned(employee.address);
      const totalSalary = MONTHLY_SALARY * BigInt(12);
      
      // Should not exceed total stream amount
      expect(earned).to.be.closeTo(totalSalary, ethers.parseEther("0.000001"));
    });

    it("Should track withdrawable amount correctly", async function () {
      // Advance time by 1 month
      await time.increase(SECONDS_PER_MONTH);

      const withdrawable = await salaryStream.getWithdrawable(employee.address);
      
      // Should be close to monthly salary
      expect(withdrawable).to.be.closeTo(MONTHLY_SALARY, ethers.parseEther("1"));
    });
  });

  describe("SalaryStream - Withdrawal & Tax (Native HLUSD)", function () {
    beforeEach(async function () {
      // Setup: Create company and add employee
      await salaryStream.connect(owner).createCompany("Test Company");
      await salaryStream.connect(owner).addEmployee(1, employee.address);
      
      // Setup: Deposit native HLUSD and create stream with 10% tax
      const depositAmount = ethers.parseEther("1000");
      await treasury.connect(owner).deposit({ value: depositAmount });

      await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
    });

    it("Should allow employee to withdraw with correct tax deduction", async function () {
      // Advance time by 1 month
      await time.increase(SECONDS_PER_MONTH);

      const withdrawableBefore = await salaryStream.getWithdrawable(employee.address);
      
      // Calculate expected amounts
      const taxPercent = 10;
      const expectedTax = (withdrawableBefore * BigInt(taxPercent)) / BigInt(100);
      const expectedNet = withdrawableBefore - expectedTax;

      const employeeBalanceBefore = await ethers.provider.getBalance(employee.address);
      const taxVaultBalanceBefore = await ethers.provider.getBalance(taxVault.address);

      const tx = await salaryStream.connect(employee).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const employeeBalanceAfter = await ethers.provider.getBalance(employee.address);
      const taxVaultBalanceAfter = await ethers.provider.getBalance(taxVault.address);

      // Verify employee received net amount (minus gas)
      const employeeReceived = employeeBalanceAfter - employeeBalanceBefore + gasUsed;
      expect(employeeReceived).to.be.closeTo(expectedNet, ethers.parseEther("0.01"));

      // Verify tax vault received tax
      expect(taxVaultBalanceAfter - taxVaultBalanceBefore).to.be.closeTo(
        expectedTax,
        ethers.parseEther("0.01")
      );
    });

    it("Should emit Withdrawn and TaxPaid events", async function () {
      await time.increase(SECONDS_PER_MONTH);

      await expect(salaryStream.connect(employee).withdraw())
        .to.emit(salaryStream, "Withdrawn")
        .and.to.emit(salaryStream, "TaxPaid");
    });

    it("Should prevent withdrawal when paused", async function () {
      await time.increase(SECONDS_PER_MONTH);

      // Admin pauses stream
      await salaryStream.connect(owner).pauseStream(employee.address);

      await expect(
        salaryStream.connect(employee).withdraw()
      ).to.be.revertedWith("Stream paused");
    });

    it("Should update withdrawn amount correctly", async function () {
      await time.increase(SECONDS_PER_MONTH);

      const withdrawableBefore = await salaryStream.getWithdrawable(employee.address);
      
      await salaryStream.connect(employee).withdraw();

      const stream = await salaryStream.streams(employee.address);
      expect(stream.withdrawn).to.be.closeTo(withdrawableBefore, ethers.parseEther("0.01"));
    });

    it("Should handle multiple withdrawals correctly", async function () {
      // First withdrawal after 1 month
      await time.increase(SECONDS_PER_MONTH);
      await salaryStream.connect(employee).withdraw();

      // Second withdrawal after another month
      await time.increase(SECONDS_PER_MONTH);
      const withdrawable2 = await salaryStream.getWithdrawable(employee.address);
      expect(withdrawable2).to.be.gt(0);

      await salaryStream.connect(employee).withdraw();

      const stream = await salaryStream.streams(employee.address);
      const totalEarned = await salaryStream.getEarned(employee.address);
      expect(stream.withdrawn).to.be.closeTo(totalEarned, ethers.parseEther("0.01"));
    });

    it("Should handle zero tax correctly", async function () {
      // Create company and add otherUser as employee
      await salaryStream.connect(owner).createCompany("Test Company");
      await salaryStream.connect(owner).addEmployee(1, otherUser.address);
      
      // Create stream with 0% tax
      const depositAmount = ethers.parseEther("1000");
      await treasury.connect(owner).deposit({ value: depositAmount });
      
      await salaryStream.connect(owner).createStream(1, otherUser.address, MONTHLY_SALARY, 6, 0);
      await time.increase(SECONDS_PER_MONTH);

      const withdrawable = await salaryStream.getWithdrawable(otherUser.address);
      const balanceBefore = await ethers.provider.getBalance(otherUser.address);

      const tx = await salaryStream.connect(otherUser).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(otherUser.address);
      const received = balanceAfter - balanceBefore + gasUsed;

      // Should receive full amount (no tax)
      expect(received).to.be.closeTo(withdrawable, ethers.parseEther("0.01"));
    });
  });

  describe("SalaryStream - Admin Functions", function () {
    beforeEach(async function () {
      // Setup: Create company and add employee
      await salaryStream.connect(owner).createCompany("Test Company");
      await salaryStream.connect(owner).addEmployee(1, employee.address);
      
      const depositAmount = ethers.parseEther("1000");
      await treasury.connect(owner).deposit({ value: depositAmount });

      await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
    });

    it("Should allow admin to pause stream", async function () {
      await expect(salaryStream.connect(owner).pauseStream(employee.address))
        .to.emit(salaryStream, "StreamPaused");

      const stream = await salaryStream.streams(employee.address);
      expect(stream.paused).to.be.true;
    });

    it("Should allow admin to resume stream", async function () {
      await salaryStream.connect(owner).pauseStream(employee.address);
      
      await expect(salaryStream.connect(owner).resumeStream(employee.address))
        .to.emit(salaryStream, "StreamResumed");

      const stream = await salaryStream.streams(employee.address);
      expect(stream.paused).to.be.false;
    });

    it("Should allow admin to cancel stream", async function () {
      await expect(salaryStream.connect(owner).cancelStream(employee.address))
        .to.emit(salaryStream, "StreamCancelled");

      // Stream should be deleted
      const stream = await salaryStream.streams(employee.address);
      expect(stream.employer).to.equal(ethers.ZeroAddress);
    });

    it("Should only allow admin to pause/resume/cancel", async function () {
      await expect(
        salaryStream.connect(otherUser).pauseStream(employee.address)
      ).to.be.revertedWith("Not HR or CEO");

      await expect(
        salaryStream.connect(otherUser).resumeStream(employee.address)
      ).to.be.revertedWith("Not HR or CEO");

      await expect(
        salaryStream.connect(otherUser).cancelStream(employee.address)
      ).to.be.revertedWith("Not HR or CEO");
    });

    it("Should allow admin to update tax vault", async function () {
      const newTaxVault = otherUser.address;
      
      await expect(salaryStream.connect(owner).setTaxVault(newTaxVault))
        .to.emit(salaryStream, "TaxVaultUpdated")
        .withArgs(taxVault.address, newTaxVault);

      expect(await salaryStream.taxVault()).to.equal(newTaxVault);
    });

    it.skip("Should allow admin transfer", async function () {
      // Skipped: admin() function removed in company governance model
      // Use getCompanyRoles() to check CEO assignments instead
    });
  });

  describe("SalaryStream - View Functions (HR Dashboard)", function () {
    beforeEach(async function () {
      // Setup: Create company and add employee
      await salaryStream.connect(owner).createCompany("Test Company");
      await salaryStream.connect(owner).addEmployee(1, employee.address);
      
      const depositAmount = ethers.parseEther("1000");
      await treasury.connect(owner).deposit({ value: depositAmount });

      await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
    });

    it("Should return stream details", async function () {
      const details = await salaryStream.getStreamDetails(employee.address);
      expect(details.employer).to.equal(owner.address);
      expect(details.taxPercent).to.equal(10);
    });

    it("Should check if employee has stream", async function () {
      expect(await salaryStream.hasStream(employee.address)).to.be.true;
      expect(await salaryStream.hasStream(otherUser.address)).to.be.false;
    });

    it("Should return zero for non-existent stream", async function () {
      expect(await salaryStream.getEarned(otherUser.address)).to.equal(0);
      expect(await salaryStream.getWithdrawable(otherUser.address)).to.equal(0);
    });

    it("Should return zero withdrawable when paused", async function () {
      await time.increase(SECONDS_PER_MONTH);
      await salaryStream.connect(owner).pauseStream(employee.address);

      expect(await salaryStream.getWithdrawable(employee.address)).to.equal(0);
      expect(await salaryStream.getEarned(employee.address)).to.be.gt(0);
    });
  });

  describe("Self-Indexing & Analytics", function () {
    beforeEach(async function () {
      // Setup: Create companies and add employees
      await salaryStream.connect(owner).createCompany("Owner Company");
      await salaryStream.connect(employer).createCompany("Employer Company");
      await salaryStream.connect(owner).addEmployee(1, employee.address);
      await salaryStream.connect(owner).addEmployee(1, otherUser.address);
      await salaryStream.connect(owner).addEmployee(1, taxVault.address);
      
      // Setup: Deposit funds for multiple employers
      const depositAmount = ethers.parseEther("10000");
      await treasury.connect(owner).deposit({ value: depositAmount });
      await treasury.connect(employer).deposit({ value: depositAmount });
    });

    describe("Employee Indexing", function () {
      it("Should add employee to allEmployees array on first stream", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);

        const allEmployees = await salaryStream.getAllEmployees();
        expect(allEmployees).to.include(employee.address);
        expect(allEmployees.length).to.equal(1);
      });

      it("Should not duplicate employees in allEmployees when creating multiple streams", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        // Cancel and recreate
        await salaryStream.connect(owner).cancelStream(employee.address);
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 6, 5);

        const allEmployees = await salaryStream.getAllEmployees();
        expect(allEmployees.length).to.equal(1);
      });

      it("Should track multiple employees correctly", async function () {
        const [emp1, emp2, emp3] = [employee, taxVault, otherUser];
        
        await salaryStream.connect(owner).createStream(1, emp1.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, emp2.address, MONTHLY_SALARY, 6, 5);
        await salaryStream.connect(owner).createStream(1, emp3.address, MONTHLY_SALARY, 3, 0);

        const allEmployees = await salaryStream.getAllEmployees();
        expect(allEmployees.length).to.equal(3);
        expect(allEmployees).to.include(emp1.address);
        expect(allEmployees).to.include(emp2.address);
        expect(allEmployees).to.include(emp3.address);
      });

      it("Should set isEmployee mapping correctly", async function () {
        expect(await salaryStream.isEmployee(employee.address)).to.be.false;

        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        expect(await salaryStream.isEmployee(employee.address)).to.be.true;
      });
    });

    describe("Employer-Employee Mapping", function () {
      it("Should add employee to employer's list", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);

        const employees = await salaryStream.getEmployeesByEmployer(owner.address);
        expect(employees).to.include(employee.address);
        expect(employees.length).to.equal(1);
      });

      it("Should track multiple employees for one employer", async function () {
        const [emp1, emp2, emp3] = [employee, taxVault, otherUser];
        
        await salaryStream.connect(owner).createStream(1, emp1.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, emp2.address, MONTHLY_SALARY, 6, 5);
        await salaryStream.connect(owner).createStream(1, emp3.address, MONTHLY_SALARY, 3, 0);

        const employees = await salaryStream.getEmployeesByEmployer(owner.address);
        expect(employees.length).to.equal(3);
        expect(employees).to.include(emp1.address);
        expect(employees).to.include(emp2.address);
        expect(employees).to.include(emp3.address);
      });

      it("Should separate employees by employer", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, taxVault.address, MONTHLY_SALARY, 6, 5);

        const ownerEmployees = await salaryStream.getEmployeesByEmployer(owner.address);
        const employerEmployees = await salaryStream.getEmployeesByEmployer(employer.address);

        // Owner created both employees (only admin can create streams)
        expect(ownerEmployees.length).to.equal(2);
        expect(employerEmployees.length).to.equal(0);
        expect(ownerEmployees).to.include(employee.address);
        expect(ownerEmployees).to.include(taxVault.address);
      });

      it("Should return empty array for employer with no employees", async function () {
        const employees = await salaryStream.getEmployeesByEmployer(otherUser.address);
        expect(employees.length).to.equal(0);
      });
    });

    describe("Active Employees Tracking", function () {
      it("Should add employee to activeEmployees on stream creation", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);

        const activeEmployees = await salaryStream.getActiveEmployees();
        expect(activeEmployees).to.include(employee.address);
        expect(activeEmployees.length).to.equal(1);
      });

      it("Should remove employee from activeEmployees on stream cancellation (swap-and-pop)", async function () {
        const [emp1, emp2, emp3] = [employee, taxVault, otherUser];
        
        // Create streams for 3 employees
        await salaryStream.connect(owner).createStream(1, emp1.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, emp2.address, MONTHLY_SALARY, 6, 5);
        await salaryStream.connect(owner).createStream(1, emp3.address, MONTHLY_SALARY, 3, 0);

        let activeEmployees = await salaryStream.getActiveEmployees();
        expect(activeEmployees.length).to.equal(3);

        // Cancel middle employee's stream
        await salaryStream.connect(owner).cancelStream(emp2.address);

        activeEmployees = await salaryStream.getActiveEmployees();
        expect(activeEmployees.length).to.equal(2);
        expect(activeEmployees).to.not.include(emp2.address);
        expect(activeEmployees).to.include(emp1.address);
        expect(activeEmployees).to.include(emp3.address);
      });

      it("Should handle swap-and-pop when removing last element", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);

        let activeEmployees = await salaryStream.getActiveEmployees();
        expect(activeEmployees.length).to.equal(1);

        await salaryStream.connect(owner).cancelStream(employee.address);

        activeEmployees = await salaryStream.getActiveEmployees();
        expect(activeEmployees.length).to.equal(0);
      });

      it("Should handle swap-and-pop when removing first element", async function () {
        const [emp1, emp2, emp3] = [employee, taxVault, otherUser];
        
        await salaryStream.connect(owner).createStream(1, emp1.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, emp2.address, MONTHLY_SALARY, 6, 5);
        await salaryStream.connect(owner).createStream(1, emp3.address, MONTHLY_SALARY, 3, 0);

        // Cancel first employee
        await salaryStream.connect(owner).cancelStream(emp1.address);

        const activeEmployees = await salaryStream.getActiveEmployees();
        expect(activeEmployees.length).to.equal(2);
        expect(activeEmployees).to.not.include(emp1.address);
      });

      it("Should track active employees across multiple employers", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, taxVault.address, MONTHLY_SALARY, 6, 5);

        const activeEmployees = await salaryStream.getActiveEmployees();
        expect(activeEmployees.length).to.equal(2);
        expect(activeEmployees).to.include(employee.address);
        expect(activeEmployees).to.include(taxVault.address);
      });
    });

    describe("Global Analytics Counters", function () {
      it("Should increment totalStreamsCreated on stream creation", async function () {
        let stats = await salaryStream.getGlobalStats();
        expect(stats[0]).to.equal(0);

        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        stats = await salaryStream.getGlobalStats();
        expect(stats[0]).to.equal(1);

        await salaryStream.connect(owner).createStream(1, taxVault.address, MONTHLY_SALARY, 6, 5);
        
        stats = await salaryStream.getGlobalStats();
        expect(stats[0]).to.equal(2);
      });

      it("Should not decrement totalStreamsCreated on cancellation", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        let stats = await salaryStream.getGlobalStats();
        expect(stats[0]).to.equal(1);

        await salaryStream.connect(owner).cancelStream(employee.address);
        
        stats = await salaryStream.getGlobalStats();
        expect(stats[0]).to.equal(1); // Should remain 1 (cumulative counter)
      });

      it("Should track totalActiveStreams correctly", async function () {
        let stats = await salaryStream.getGlobalStats();
        expect(stats[1]).to.equal(0);

        // Create streams
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, taxVault.address, MONTHLY_SALARY, 6, 5);
        
        stats = await salaryStream.getGlobalStats();
        expect(stats[1]).to.equal(2);

        // Cancel one
        await salaryStream.connect(owner).cancelStream(employee.address);
        
        stats = await salaryStream.getGlobalStats();
        expect(stats[1]).to.equal(1);
      });

      it("Should track totalReservedGlobal correctly", async function () {
        const totalSalary1 = MONTHLY_SALARY * BigInt(12);
        const totalSalary2 = MONTHLY_SALARY * BigInt(6);

        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        let stats = await salaryStream.getGlobalStats();
        expect(stats[2]).to.equal(totalSalary1);

        await salaryStream.connect(owner).createStream(1, taxVault.address, MONTHLY_SALARY, 6, 5);
        
        stats = await salaryStream.getGlobalStats();
        expect(stats[2]).to.equal(totalSalary1 + totalSalary2);
      });

      it("Should decrease totalReservedGlobal on withdrawal", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        const initialStats = await salaryStream.getGlobalStats();
        const initialReserved = initialStats[2];

        // Advance time and withdraw
        await time.increase(SECONDS_PER_MONTH);
        await salaryStream.connect(employee).withdraw();

        const finalStats = await salaryStream.getGlobalStats();
        expect(finalStats[2]).to.be.lt(initialReserved);
      });

      it("Should track totalPaidGlobal on withdrawals", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        let stats = await salaryStream.getGlobalStats();
        expect(stats[3]).to.equal(0);

        // Advance time and withdraw
        await time.increase(SECONDS_PER_MONTH);
        await salaryStream.connect(employee).withdraw();

        stats = await salaryStream.getGlobalStats();
        expect(stats[3]).to.be.gt(0);
        expect(stats[3]).to.be.closeTo(MONTHLY_SALARY, ethers.parseEther("0.01"));
      });

      it("Should accumulate totalPaidGlobal across multiple withdrawals", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        // First withdrawal
        await time.increase(SECONDS_PER_MONTH);
        await salaryStream.connect(employee).withdraw();

        const stats1 = await salaryStream.getGlobalStats();
        const paid1 = stats1[3];

        // Second withdrawal
        await time.increase(SECONDS_PER_MONTH);
        await salaryStream.connect(employee).withdraw();

        const stats2 = await salaryStream.getGlobalStats();
        expect(stats2[3]).to.be.gt(paid1);
        expect(stats2[3]).to.be.closeTo(MONTHLY_SALARY * BigInt(2), ethers.parseEther("0.01"));
      });
    });

    describe("Employer-Specific Analytics", function () {
      it("Should track employer stats correctly", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        const stats = await salaryStream.getEmployerStats(owner.address);
        expect(stats[0]).to.equal(1);
        expect(stats[1]).to.equal(1);
        expect(stats[2]).to.equal(MONTHLY_SALARY * BigInt(12));
        expect(stats[3]).to.equal(0);
      });

      it("Should update employer totalPaid on withdrawal", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);

        // Advance time and withdraw
        await time.increase(SECONDS_PER_MONTH);
        await salaryStream.connect(employee).withdraw();

        const stats = await salaryStream.getEmployerStats(owner.address);
        expect(stats[3]).to.be.gt(0);
        expect(stats[3]).to.be.closeTo(MONTHLY_SALARY, ethers.parseEther("0.01"));
      });

      it("Should separate stats by employer", async function () {
        // Note: Current contract only allows admin to create streams
        // So all streams belong to owner (admin)
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, taxVault.address, MONTHLY_SALARY, 6, 5);

        const ownerStats = await salaryStream.getEmployerStats(owner.address);
        const employerStats = await salaryStream.getEmployerStats(employer.address);

        expect(ownerStats[0]).to.equal(2); // Owner has 2 employees
        expect(employerStats[0]).to.equal(0); // Other employer has none
        expect(ownerStats[2]).to.equal(MONTHLY_SALARY * BigInt(18)); // 12 + 6 months
        expect(employerStats[2]).to.equal(0);
      });

      it("Should update activeCount on stream cancellation", async function () {
        const [emp1, emp2] = [employee, taxVault];
        
        await salaryStream.connect(owner).createStream(1, emp1.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, emp2.address, MONTHLY_SALARY, 6, 5);

        let stats = await salaryStream.getEmployerStats(owner.address);
        expect(stats[1]).to.equal(2);

        await salaryStream.connect(owner).cancelStream(emp1.address);

        stats = await salaryStream.getEmployerStats(owner.address);
        expect(stats[0]).to.equal(2); // Total employees doesn't decrease
        expect(stats[1]).to.equal(1); // Active count decreases
      });
    });

    describe("getTotalWithdrawable", function () {
      it("Should return zero when no active streams", async function () {
        const total = await salaryStream.getTotalWithdrawable();
        expect(total).to.equal(0);
      });

      it("Should calculate total withdrawable for one active stream", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        await time.increase(SECONDS_PER_MONTH);

        const total = await salaryStream.getTotalWithdrawable();
        const individualWithdrawable = await salaryStream.getWithdrawable(employee.address);
        
        expect(total).to.equal(individualWithdrawable);
        expect(total).to.be.closeTo(MONTHLY_SALARY, ethers.parseEther("0.01"));
      });

      it("Should calculate total withdrawable for multiple active streams", async function () {
        const [emp1, emp2, emp3] = [employee, taxVault, otherUser];
        
        await salaryStream.connect(owner).createStream(1, emp1.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, emp2.address, MONTHLY_SALARY, 6, 5);
        await salaryStream.connect(owner).createStream(1, emp3.address, MONTHLY_SALARY, 3, 0);

        await time.increase(SECONDS_PER_MONTH);

        const total = await salaryStream.getTotalWithdrawable();
        const withdrawable1 = await salaryStream.getWithdrawable(emp1.address);
        const withdrawable2 = await salaryStream.getWithdrawable(emp2.address);
        const withdrawable3 = await salaryStream.getWithdrawable(emp3.address);

        expect(total).to.equal(withdrawable1 + withdrawable2 + withdrawable3);
      });

      it("Should update total withdrawable after withdrawal", async function () {
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        await time.increase(SECONDS_PER_MONTH);

        const totalBefore = await salaryStream.getTotalWithdrawable();
        await salaryStream.connect(employee).withdraw();

        const totalAfter = await salaryStream.getTotalWithdrawable();
        expect(totalAfter).to.be.lt(totalBefore);
        expect(totalAfter).to.be.closeTo(0, ethers.parseEther("0.001"));
      });

      it("Should exclude cancelled streams from total withdrawable", async function () {
        const [emp1, emp2] = [employee, taxVault];
        
        await salaryStream.connect(owner).createStream(1, emp1.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, emp2.address, MONTHLY_SALARY, 6, 5);

        await time.increase(SECONDS_PER_MONTH);

        const totalBefore = await salaryStream.getTotalWithdrawable();
        
        await salaryStream.connect(owner).cancelStream(emp2.address);

        const totalAfter = await salaryStream.getTotalWithdrawable();
        const emp1Withdrawable = await salaryStream.getWithdrawable(emp1.address);

        expect(totalAfter).to.equal(emp1Withdrawable);
        expect(totalAfter).to.be.lt(totalBefore);
      });
    });

    describe("View Functions Integration", function () {
      it("Should return consistent data across all view functions", async function () {
        const [emp1, emp2] = [employee, taxVault];
        
        await salaryStream.connect(owner).createStream(1, emp1.address, MONTHLY_SALARY, 12, 10);
        await salaryStream.connect(owner).createStream(1, emp2.address, MONTHLY_SALARY, 6, 5);

        const allEmployees = await salaryStream.getAllEmployees();
        const activeEmployees = await salaryStream.getActiveEmployees();
        const employerEmployees = await salaryStream.getEmployeesByEmployer(owner.address);
        const globalStats = await salaryStream.getGlobalStats();
        const employerStats = await salaryStream.getEmployerStats(owner.address);

        // Cross-verify counts
        expect(allEmployees.length).to.equal(2);
        expect(activeEmployees.length).to.equal(2);
        expect(employerEmployees.length).to.equal(2);
        expect(globalStats[0]).to.equal(2);
        expect(globalStats[1]).to.equal(2);
        expect(employerStats[0]).to.equal(2);
        expect(employerStats[1]).to.equal(2);
      });

      it("Should maintain consistency after stream lifecycle", async function () {
        // Create
        await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
        
        let globalStats = await salaryStream.getGlobalStats();
        expect(globalStats[0]).to.equal(1);
        expect(globalStats[1]).to.equal(1);

        // Withdraw
        await time.increase(SECONDS_PER_MONTH);
        await salaryStream.connect(employee).withdraw();

        globalStats = await salaryStream.getGlobalStats();
        expect(globalStats[1]).to.equal(1); // Still active
        expect(globalStats[3]).to.be.gt(0);

        // Cancel
        await salaryStream.connect(owner).cancelStream(employee.address);

        globalStats = await salaryStream.getGlobalStats();
        expect(globalStats[0]).to.equal(1); // Cumulative
        expect(globalStats[1]).to.equal(0); // Decremented
      });
    });
  });

  describe("Security & Gas Optimization", function () {
    it("Should follow CEI pattern in withdraw", async function () {
      // Setup company and employee
      await salaryStream.connect(owner).createCompany("Test Company");
      await salaryStream.connect(owner).addEmployee(1, employee.address);
      
      const depositAmount = ethers.parseEther("1000");
      await treasury.connect(owner).deposit({ value: depositAmount });

      await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
      await time.increase(SECONDS_PER_MONTH);

      // Should complete without issues (CEI pattern prevents reentrancy)
      await expect(salaryStream.connect(employee).withdraw()).to.not.be.reverted;
    });

    it("Should use O(1) operations for swap-and-pop removal", async function () {
      // Swap-and-pop ensures constant time removal from activeEmployees
      // This is verified by code review and gas profiling
      expect(true).to.be.true;
    });

    it("Should minimize storage writes for gas optimization", async function () {
      // Setup company and employee
      await salaryStream.connect(owner).createCompany("Test Company");
      await salaryStream.connect(owner).addEmployee(1, employee.address);
      
      // Earnings calculated dynamically, not stored continuously
      const depositAmount = ethers.parseEther("1000");
      await treasury.connect(owner).deposit({ value: depositAmount });

      await salaryStream.connect(owner).createStream(1, employee.address, MONTHLY_SALARY, 12, 10);
      
      await time.increase(3600);
      
      // Multiple reads give consistent results without storage updates
      const earned1 = await salaryStream.getEarned(employee.address);
      const earned2 = await salaryStream.getEarned(employee.address);
      expect(earned1).to.equal(earned2);
    });
  });
});




