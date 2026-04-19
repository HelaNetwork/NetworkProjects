const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const openai = new OpenAI({
  baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.OPENAI_API_KEY || process.env.NVIDIA_API_KEY,
});

const app = express();

app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {
    console.log(`[BACKEND] Received /analyze request at ${new Date().toISOString()}`);
    const { transaction_data } = req.body || {};

    if (!transaction_data) {
        return res.status(400).json({ error: "transaction_data is required" });
    }

    // Risk detection keywords (Fallback/Safety check)
    const highRiskKeywords = [
        /approve.*unlimited/i,
        /transfer.*all/i,
        /setowner/i,
        /selfdestruct/i,
        /0xffffffffffffffffffffffffffffffff/i,
        /0x[f]{64}/i
    ];
    const mediumRiskKeywords = [
        /unknown contract/i,
        /suspicious token/i,
        /permit/i
    ];

    let riskLevel = "LOW";
    let summary = "This transaction appears safe.";
    let risks = [];

    if (highRiskKeywords.some(regex => regex.test(transaction_data))) {
        riskLevel = "HIGH";
        risks.push("Unlimited approvals or full transfers detected.");
        summary = "HIGH RISK: Potentially malicious!";
    } else if (mediumRiskKeywords.some(regex => regex.test(transaction_data))) {
        riskLevel = "MEDIUM";
        risks.push("Suspicious patterns found.");
        summary = "MEDIUM RISK: Proceed with caution.";
    }

    async function analyzeWithAI(txData) {
        if (!process.env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY === 'nvapi-your-key-here') {
            return {
                summary: summary,
                risk_level: riskLevel,
                risk_score: riskLevel === "HIGH" ? 90 : riskLevel === "MEDIUM" ? 50 : 10,
                risk_factors: risks,
                explanation: {
                    simple: risks.join(" ") || "No specific risks identified.",
                    technical: "API key not configured. Using keyword fallback."
                }
            };
        }

        try {
            const completion = await openai.chat.completions.create({
                model: "meta/llama-3.3-70b-instruct",
                messages: [
                    {
                        role: "system",
                        content: "You are a crypto security expert. Analyze transactions and return structured JSON: {summary, risk_level (LOW/MEDIUM/HIGH/CRITICAL), risk_score (0-100), risk_factors (array), explanation {simple, technical}}."
                    },
                    {
                        role: "user",
                        content: `Analyze: ${txData}`
                    }
                ],
                temperature: 0.2,
                top_p: 0.7,
                max_tokens: 1024
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('NVIDIA API error:', error);
            return null;
        }
    }

    const aiAnalysis = await analyzeWithAI(transaction_data);
    
    if (aiAnalysis) {
        console.log("[BACKEND] AI Analysis successful");
        res.json(aiAnalysis);
    } else {
        console.warn("[BACKEND] AI Analysis failed. Returning documented error response.");
        // Match documented 500 Internal Server Error structure
        res.status(500).json({
            error: "Analysis failed",
            message: "AI service temporarily unavailable. Using keyword analysis fallback for safety.",
            fallback_data: {
                summary: summary,
                risk_level: riskLevel,
                risk_score: riskLevel === "HIGH" ? 95 : (riskLevel === "MEDIUM" ? 60 : 15),
                risk_factors: risks
            }
        });
    }
});

app.post("/chat", async (req, res) => {
    const { message, transaction_data } = req.body;

    if (!message) {
        return res.status(400).json({ error: "message is required" });
    }

    const context = transaction_data ? `Transaction context: ${transaction_data}` : '';
    const fullPrompt = `${context} Q: ${message}`;

    if (!process.env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY === 'nvapi-your-key-here') {
        return res.json({ reply: "Chat requires NVIDIA API key in .env. Message noted for demo." });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.3-70b-instruct",
            messages: [
                {
                    role: "system",
                    content: "You are a crypto wallet assistant. Answer clearly about transactions and security."
                },
                {
                    role: "user",
                    content: fullPrompt
                }
            ],
            temperature: 0.2,
            top_p: 0.7,
            max_tokens: 1024
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error('Chat OpenAI error:', error);
        res.status(500).json({ reply: `[AI TERMINAL ERROR] Authentication failed with AI Provider (${error.message}). Please update backend/.env with a valid API key.` });
    }
});

app.listen(5000, () => console.log("AI Wallet Backend on port 5000"));
