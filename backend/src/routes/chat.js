/**
 * Chat Route
 * POST /api/chat - AI assistant conversation endpoint
 */

const express = require('express');
const router = express.Router();
const { chat } = require('../services/aiService');

/**
 * POST /api/chat
 * Body: { message, history?, transactionContext? }
 */
router.post('/', async (req, res) => {
  try {
    const { message, history, transactionContext } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid message',
        message: 'Please provide a non-empty message string.'
      });
    }

    // Limit message length
    const trimmedMessage = message.trim().slice(0, 2000);

    // Get AI response
    const response = await chat(trimmedMessage, history || [], transactionContext || null);

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Chat failed',
      message: 'Unable to process your message. Please try again.'
    });
  }
});

module.exports = router;
