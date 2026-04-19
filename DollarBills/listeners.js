const { contract } = require("./config/blockchain");
const { updateAnalytics, stats } = require("./analytics");
const { ethers } = require("ethers");

function startPayrollListeners() {
    console.log("👂 Observer Active: Monitoring HeLa Streams...");

    // Matches Ash's 'EmployeeOnboarded' event
    contract.on("EmployeeOnboarded", (employee, yearlySalary) => {
        console.log(`🌊 New Employee Onboarded!`);
        console.log(`👤 Address: ${employee}`);
        console.log(`💰 Yearly Salary: ${ethers.formatEther(yearlySalary)} tokens`);

        stats.activeStreams += 1;
        updateAnalytics(); 
    });

    // Matches Ash's 'SalaryClaimed' event
    // Note: Ash included taxPaid in the event! No need to guess the % anymore.
    contract.on("SalaryClaimed", (employee, amount, taxPaid) => {
        console.log(`💰 Salary Claimed by ${employee}`);
        
        // Convert BigInt to readable numbers
        const claimedAmount = parseFloat(ethers.formatEther(amount));
        const taxAmount = parseFloat(ethers.formatEther(taxPaid));

        console.log(`💵 Amount: ${claimedAmount} | 🏛️ Tax: ${taxAmount}`);

        stats.totalTaxWithheld += taxAmount;
        updateAnalytics();
    });
}

module.exports = { startPayrollListeners };