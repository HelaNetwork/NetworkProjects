// chatAgent.js — GasSafe Compliance AI Agent
// Uses Hugging Face Inference API via OpenAI-compatible SDK
// Matches the same client pattern as scoringAgent.js

const OpenAI = require("openai");
const { getAll, readDB, computeMerkleRoot } = require("./auditLogger");

// ── HF client (same setup as scoringAgent) ─────────────────────
const llmClient = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

// Qwen2.5-72B has reliable OpenAI-compatible tool/function calling
const MODEL = "Qwen/Qwen2.5-72B-Instruct:novita";

// ── Tool definitions (OpenAI function-calling schema) ──────────
const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_platform_stats",
      description:
        "Returns live platform statistics: total users, total bookings, pending/delivered counts, risk tier breakdown (GREEN/YELLOW/RED), total DLE audit entries, number of overridden decisions, and the current Merkle root.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_audit_log",
      description:
        "Returns Decision Log Entries (DLEs) — the cryptographic audit trail of every AI agent decision. Each entry includes agent_id, decision_type, fraud_score, risk_tier, confidence, reasoning summary, and whether it was overridden.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Max number of entries to return. Default 20.",
          },
          agent_filter: {
            type: "string",
            description:
              "Filter by agent: 'booking-agent' or 'scoring-agent'. Omit to return all.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_overridden_decisions",
      description:
        "Returns only DLE entries that were manually overridden by an admin, including before/after fraud scores, risk labels, and the justification reason.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "search_by_trace_id",
      description:
        "Returns all DLE entries belonging to a specific session trace ID. Useful for forensic investigation of a single user session.",
      parameters: {
        type: "object",
        required: ["trace_id"],
        properties: {
          trace_id: {
            type: "string",
            description: "The session trace ID to look up.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_high_risk_bookings",
      description:
        "Returns bookings flagged as RED tier (risk_tier=2) — the highest fraud risk level — with wallet addresses, fraud scores, and delivery statuses.",
      parameters: { type: "object", properties: {} },
    },
  },
];

// ── Tool executor ──────────────────────────────────────────────
function executeTool(name, args = {}) {
  const log = getAll();
  const db = readDB();
  const bookings = Object.values(db.bookings || {});
  const users = Object.values(db.users || {});

  if (name === "get_platform_stats") {
    return {
      totalUsers: users.length,
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b) => b.status === "PENDING").length,
      deliveredBookings: bookings.filter((b) => b.status === "DELIVERED").length,
      greenBookings: bookings.filter((b) => b.riskTier === 0).length,
      yellowBookings: bookings.filter((b) => b.riskTier === 1).length,
      redBookings: bookings.filter((b) => b.riskTier === 2).length,
      totalDLEs: log.length,
      overriddenDLEs: log.filter((d) => d.override_history.length > 0).length,
      merkleRoot: computeMerkleRoot(),
    };
  }

  if (name === "get_audit_log") {
    const limit = args.limit || 20;
    let entries = [...log].reverse();
    if (args.agent_filter) {
      entries = entries.filter((e) => e.agent_id === args.agent_filter);
    }
    return entries.slice(0, limit).map((e) => ({
      dle_id: e.dle_id,
      agent_id: e.agent_id,
      decision_type: e.decision_type,
      timestamp: e.timestamp,
      fraud_score: e.output?.fraud_score,
      risk_tier: e.output?.risk_tier,
      risk_label: e.output?.risk_label,
      confidence: e.confidence,
      summary: e.reasoning?.summary,
      has_override: e.override_history.length > 0,
    }));
  }

  if (name === "get_overridden_decisions") {
    return log
      .filter((d) => d.override_history.length > 0)
      .map((d) => ({
        dle_id: d.dle_id,
        agent_id: d.agent_id,
        decision_type: d.decision_type,
        timestamp: d.timestamp,
        overrides: d.override_history.map((o) => ({
          challenged_by: o.challenged_by,
          reason: o.reason,
          original_fraud_score: o.original_output?.fraud_score,
          new_fraud_score: o.new_output?.fraud_score,
          original_risk_label: o.original_output?.risk_label,
          new_risk_label: o.new_output?.risk_label,
          override_time: o.timestamp,
        })),
      }));
  }

  if (name === "search_by_trace_id") {
    return log.filter((d) => d.trace_id === args.trace_id);
  }

  if (name === "get_high_risk_bookings") {
    return bookings
      .filter((b) => b.riskTier === 2)
      .map((b) => ({
        booking_id: b.bookingId,
        wallet: b.walletAddress,
        status: b.status,
        risk_tier: b.riskTier,
        fraud_score: b.fraudScore,
        created_at: b.createdAt,
      }));
  }

  return { error: `Unknown tool: ${name}` };
}

// ── System prompt ──────────────────────────────────────────────
const SYSTEM_PROMPT = `You are GasSafe Compliance AI, an intelligent assistant embedded in the GasSafe blockchain-based LPG delivery platform.

You have real-time access to tools that query live data from the blockchain audit system:
- Platform statistics (users, bookings, risk tier distributions)
- Decision Log Entries (DLEs) — cryptographic records of every AI agent decision
- Manual override history with before/after diffs and admin justifications
- Fraud scores and risk tier classifications (GREEN/YELLOW/RED)
- Merkle root of the cryptographic audit chain

Guidelines:
- Always use tools to fetch fresh data before answering any statistical or data-related questions
- Be concise but insightful — highlight anomalies or concerning patterns proactively
- Explain technical terms clearly when asked (e.g. Merkle root, DLE, AAEP, risk tiers)
- Format percentages and numbers cleanly (e.g. "47% of bookings are GREEN tier")
- Never fabricate data — only report what the tools return
- Keep responses under 300 words unless a detailed report is explicitly requested`;

// ── Main chat function ─────────────────────────────────────────
async function chat(history, userMessage) {
  // Build message array in OpenAI format
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  const toolCalls = []; // collect all tool invocations to return to the frontend

  // Agentic loop: keep calling the model until it returns a plain text response
  while (true) {
    const response = await llmClient.chat.completions.create({
      model: MODEL,
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      max_tokens: 1024,
      temperature: 0.3,
    });

    const choice = response.choices[0];
    messages.push(choice.message); // append assistant turn to history

    // No tool calls → final text answer ready
    if (!choice.message.tool_calls || choice.message.tool_calls.length === 0) {
      return { reply: choice.message.content, toolCalls };
    }

    // Execute each requested tool call and push results back into the conversation
    for (const tc of choice.message.tool_calls) {
      let args = {};
      try {
        args = JSON.parse(tc.function.arguments || "{}");
      } catch (_) { }

      const result = executeTool(tc.function.name, args);
      console.log(`[chatAgent] Tool called: ${tc.function.name}`, args);

      // Record for the frontend
      toolCalls.push({ name: tc.function.name, args });

      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }
  }
}

module.exports = { chat };
