const express = require("express");
const router = express.Router();
const { stats } = require("./analytics");

// This is the "Heart" of the dashboard
router.get("/stats", (req, res) => {
    res.json({
        success: true,
        data: stats
    });
});

// This is for the "Compliance" page
router.get("/compliance", (req, res) => {
    res.json({
        success: true,
        taxRedirection: "10%",
        totalTaxWithheld: stats.totalTaxWithheld,
        vaultAddress: process.env.VAULT_ADDRESS,
        status: "Compliant"
    });
});

module.exports = router;
const { contract } = require("./config/blockchain");

router.get("/employee/:address", async (req, res) => {
    try {
        const info = await contract.employeeStreams(req.params.address);
        res.json({
            salaryPerSecond: info.salaryPerSecond.toString(),
            lastWithdrawal: info.lastWithdrawalTime.toString(),
            isActive: info.isActive
        });
    } catch (err) {
        res.status(404).json({ error: "Employee not found" });
    }
});