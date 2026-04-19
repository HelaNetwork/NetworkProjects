/**
 * Simulation Route
 * POST /api/simulate - Simulate transaction outcomes
 */

const express = require('express');
const router = express.Router();
const { simulateTransaction } = require('../services/simulator');
const { explainTransaction } = require('../services/aiService');
const { assessRisk } = require('../services/riskEngine');

/**
 * POST /api/simulate
 * Body: { to, from, data, value, gasLimit, gasPrice }
 */
router.post('/', async (req, res) => {
  try {
    const { to, from, data, value, gasLimit, gasPrice } = req.body;

    if (!to && !data) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Provide at least a "to" address or "data" field.'
      });
    }

    // Run simulation
    const simulation = simulateTransaction({ to, from, data, value, gasLimit, gasPrice });

    // Assess risk of the decoded transaction
    const riskAssessment = assessRisk(simulation.decoded);

    // Get AI explanation of the simulation
    const aiExplanation = await explainTransaction(simulation.decoded, riskAssessment);

    res.json({
      success: true,
      simulation: {
        effects: simulation.effects,
        balanceChanges: simulation.balanceChanges,
        approvalChanges: simulation.approvalChanges,
        nftTransfers: simulation.nftTransfers,
        gasCost: simulation.gasCost,
        warnings: simulation.warnings,
        summary: simulation.summary
      },
      risk: {
        score: riskAssessment.score,
        level: riskAssessment.level,
        threats: riskAssessment.threats,
        recommendations: riskAssessment.recommendations
      },
      ai: {
        explanation: aiExplanation
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      error: 'Simulation failed',
      message: error.message
    });
  }
});

module.exports = router;
