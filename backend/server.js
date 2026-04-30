/**
 * AI Wallet Assistant - Backend Server
 * Express API for transaction analysis, risk scoring, and AI chat
 */
const dotenv = require('dotenv');
dotenv.config();

const Groq = require('groq-sdk');
const express = require('express');
const cors = require('cors');

const analyzeRoutes = require('./src/routes/analyze');
const chatRoutes = require('./src/routes/chat');
const simulateRoutes = require('./src/routes/simulate');

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
const PORT = process.env.PORT || 3001;

// --------------- Middleware ---------------

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --------------- Routes ---------------

app.use('/api/analyze', analyzeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/simulate', simulateRoutes);

// --------------- AI Assistant Route ---------------

const AI_SYSTEM_PROMPT =
  'You are a Web3 AI wallet assistant. Help users with crypto, transactions, wallet balances, gas fees, and blockchain concepts.';

app.post('/api/ai', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A valid "message" string is required.' });
    }

    console.log(`[AI] Incoming prompt (${message.length} chars)`);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    const reply = completion.choices[0]?.message?.content ?? '';
    res.json({ reply });
  } catch (err) {
    console.error('[AI] Groq request failed:', err.message);
    res.status(500).json({ error: 'AI request failed. Please try again later.' });
  }
});

// --------------- Health Check ---------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------- Error Handling ---------------

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

app.listen(PORT, () => {
  console.log(`\n🛡️  AI Wallet Assistant API running on port ${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/api/health`);
  console.log(`   AI Chat: http://localhost:${PORT}/api/ai\n`);
});
