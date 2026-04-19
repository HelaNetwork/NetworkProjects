/**
 * Transaction Analysis Route
 * POST /api/analyze - Decode, assess risk, and explain a transaction
 */

const express = require('express');
const router = express.Router();
const { decodeTransaction, formatSummary } = require('../services/decoder');
const { assessRisk } = require('../services/riskEngine');
const { explainTransaction, analyzeRiskWithAI } = require('../services/aiService');

/**
 * POST /api/analyze
 * Body: { to, from, data, value, gasLimit, gasPrice, chainId }
 */
router.post('/', async (req, res) => {
  try {
    const { to, from, data, value, gasLimit, gasPrice, chainId } = req.body;

    // Validate input
    if (!to && !data) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Provide at least a "to" address or "data" field.'
      });
    }

    const txData = { to, from, data, value, gasLimit, gasPrice };

    // Step 1: Decode the transaction
    const decoded = decodeTransaction(txData);

    // Step 2: Assess risk
    const riskAssessment = assessRisk(decoded);

    // Step 3: Get AI explanation
    const [aiExplanation, aiRiskAnalysis] = await Promise.all([
      explainTransaction(decoded, riskAssessment),
      analyzeRiskWithAI(decoded, riskAssessment)
    ]);

    // Step 4: Format the summary
    const summary = formatSummary(decoded);

    res.json({
      success: true,
      decoded: {
        functionName: decoded.functionName,
        functionSignature: decoded.functionSignature,
        category: decoded.category,
        args: decoded.args,
        valueEth: decoded.valueEth,
        contractInfo: decoded.contractInfo,
        flags: decoded.flags,
        decodedSuccessfully: decoded.decoded
      },
      risk: {
        score: riskAssessment.score,
        level: riskAssessment.level,
        summary: riskAssessment.summary,
        threats: riskAssessment.threats,
        recommendations: riskAssessment.recommendations
      },
      ai: {
        explanation: aiExplanation,
        riskAnalysis: aiRiskAnalysis
      },
      summary,
      chainId: chainId || 1,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

/**
 * POST /api/analyze/decode
 * Quick decode without AI (faster response)
 */
router.post('/decode', (req, res) => {
  try {
    const { to, from, data, value, gasLimit, gasPrice } = req.body;
    const decoded = decodeTransaction({ to, from, data, value, gasLimit, gasPrice });
    const riskAssessment = assessRisk(decoded);
    const summary = formatSummary(decoded);

    res.json({
      success: true,
      decoded,
      risk: riskAssessment,
      summary
    });
  } catch (error) {
    console.error('Decode error:', error);
    res.status(500).json({ error: 'Decode failed', message: error.message });
  }
});

module.exports = router;
