const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1"
});

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "AI Wallet Assistant Backend is running!" });
});



app.post("/analyze", async (req, res) => {
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
        /0xffffffffffffffffffffffffffffffff/i, // Max uint256
        /0x[f]{64}/i // Also max uint256
    ];
    const mediumRiskKeywords = [
        /unknown contract/i,
        /suspicious token/i,
        /permit/i
    ];

    let riskLevel = "LOW";
    let summary = "This transaction appears safe.";
    let risks = [];

    // Keyword detection
    if (highRiskKeywords.some(regex => regex.test(transaction_data))) {
        riskLevel = "HIGH";
        risks.push("Unlimited approvals or full transfers detected via keyword analysis.");
        summary = "HIGH RISK: Potentially malicious!";
    } else if (mediumRiskKeywords.some(regex => regex.test(transaction_data))) {
        riskLevel = "MEDIUM";
        risks.push("Suspicious patterns found via keyword search.");
        summary = "MEDIUM RISK: Proceed with caution.";
    }

    async function analyzeWithAI(txData) {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
            return {
                summary: summary,
                risk_level: riskLevel,
                risk_score: riskLevel === "HIGH" ? 90 : (riskLevel === "MEDIUM" ? 50 : 10),
                risk_factors: risks,
                explanation: {
                    simple: (risks.join(" ") || "No specific risks identified by local scans."),
                    technical: "OpenAI not configured. Fallback keyword analysis used."
                }
            };
        }

        try {
            const completion = await openai.chat.completions.create({
                model: "meta/llama-3.3-70b-instruct",
                messages: [
                    {
                        role: "system",
                        content: `You are a Hardened Security Auditor specializing in blockchain transactions. Your primary mission is to identify malicious activity and protect users from losing funds.

Analyze the raw transaction data provided. Look for red flags such as:
1. 'Infinite Approvals': Giving a contract unlimited permission to spend a user's tokens (max uint256).
2. 'High Slippage': Swap parameters where the user could receive significantly less value than expected.
3. 'Phishing Contracts/Drainers': Known signatures for 'permit', 'setApprovalForAll' to unknown addresses, or interactions with malicious contracts.
4. 'Honeypots': Contracts that allow deposits but prevent withdrawals.

### RISK SCORING ATTACK VECTORS:
- Infinite Approval to unknown/unverified contract: 80-100 points
- Clear "Drainer" pattern (e.g., permit on all assets): 100 points
- Slippage > 10% or suspicious swap math: 50-80 points
- Interaction with blacklisted or unverified contract: 40-70 points
- Standard interaction with verified protocol: 0-20 points

### OUTPUT FORMAT:
You must return your analysis in this exact JSON structure:
{
  "summary": "One-line clear summary of the transaction's purpose.",
  "risk_level": "LOW | MEDIUM | HIGH | CRITICAL",
  "risk_score": 0-100,
  "risk_factors": ["List specific factors like 'Infinite Approval detected'", "..."],
  "explanation": {
    "simple": "Simple for Beginners: Explain what is happening like I am five, focusing on the danger.",
    "technical": "Deep Technical Summary: Detailed breakdown of the function signatures, addresses, and logic found in the raw data."
  }
}

Be paranoid. If you aren't 100% sure a transaction is safe, mark it as MEDIUM or HIGH risk.`
                    },
                    {
                        role: "user",
                        content: `Analyze this raw transaction object:
${txData}`
                    }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            });

            const aiResponse = completion.choices[0].message.content;
            return JSON.parse(aiResponse);
        } catch (error) {
            console.error('OpenAI error:', error);
            return null;
        }
    }

    const aiAnalysis = await analyzeWithAI(transaction_data);
    
    if (aiAnalysis) {
        res.json(aiAnalysis);
    } else {
        // Ultimate fallback
        res.json({
            summary: summary,
            risk_level: riskLevel,
            risk_score: riskLevel === "HIGH" ? 95 : (riskLevel === "MEDIUM" ? 60 : 15),
            risk_factors: risks,
            explanation: {
                simple: "We couldn't perform a deep analysis. " + (risks.length > 0 ? "Potential risks: " + risks.join(" ") : "Please review manually."),
                technical: "AI analysis failed or returned invalid data. Falling back to keyword-based detection."
            }
        });
    }
});


app.post("/chat", async (req, res) => {
    const { message, transaction_data } = req.body;

    if (!message) {
        return res.status(400).json({ error: "message is required" });
    }

    const context = transaction_data ? `Context transaction: ${transaction_data}\n` : '';
    const fullPrompt = `${context}Question: ${message}`;

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
        return res.json({ reply: "Chat requires OpenAI API key in .env. Message noted for demo." });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.3-70b-instruct",
            messages: [
                {
                    role: "system",
                    content: "You are an expert crypto wallet assistant. Answer questions about blockchain transactions clearly and help users avoid scams. Be concise but thorough."
                },
                {
                    role: "user",
                    content: fullPrompt
                }
            ]
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error('Chat OpenAI error:', error);
        res.json({ reply: `[AI TERMINAL ERROR] Authentication failed with AI Provider (${error.message}). Please update backend/.env with a valid OpenRouter API key.` });
    }
});

app.listen(5000, () => console.log("AI Wallet Assistant Backend running on port 5000"));

