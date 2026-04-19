# 🤖 AdminUI AI Chatbot — Implementation Plan

> Add a blockchain-aware AI chatbot panel to the GasSafe `AdminUI` page.
> The bot can answer natural-language questions about audit logs, fraud scores, risk tiers, Merkle roots, and override history — all grounded in live data from the backend.

---

## Architecture Overview

```
AdminUI.jsx (Chatbot Panel)
    └──► POST /api/chat
              └──► backend/agents/chatAgent.js (Tool Orchestrator)
                        ├── Tool: get_platform_stats  → auditLogger.readDB + getAll
                        ├── Tool: get_audit_log       → auditLogger.getAll
                        ├── Tool: get_overridden_decisions → auditLogger.getAll
                        ├── Tool: search_by_trace_id  → auditLogger.getByTraceId
                        ├── Tool: get_high_risk_bookings → auditLogger.readDB
                        └── Hugging Face Inference API (OpenAI-compatible)
```

---

## What Gets Added (nothing existing is modified or removed)

| Location | File | Status |
|---|---|---|
| `backend/agents/` | `chatAgent.js` | **New file** |
| `backend/routes/api.js` | `/chat` route | **Append 4 lines before module.exports** |
| `frontend/src/components/` | `AdminChatbot.jsx` | **New file** |
| `frontend/src/main.css` | Chatbot CSS block | **Append to end of file** |
| `frontend/src/pages/AdminUI.jsx` | Import + render | **2-line change** |

---

## Step 1 — Install the OpenAI SDK

Run from the `gassafe/` root:

```bash
npm install openai
```

Hugging Face's Inference API exposes an OpenAI-compatible endpoint, so the standard `openai` package works directly — no Hugging Face SDK needed. No new frontend dependencies are needed.

---

## Step 2 — Get a Hugging Face API Token

1. Go to https://huggingface.co/settings/tokens
2. Create a token with **"Make calls to serverless Inference API"** permission (free tier)
3. Open `gassafe/.env` and **append** (do not replace anything):

```
HF_API_KEY=hf_your_token_here
```

---

## Step 3 — Create `backend/agents/chatAgent.js`

Create a new file at `gassafe/backend/agents/chatAgent.js`:

```javascript
// chatAgent.js — AI chatbot agent with blockchain/audit tool access
// Uses Hugging Face Inference API via the OpenAI-compatible SDK
const OpenAI = require("openai");
const { getAll, readDB, computeMerkleRoot } = require("./auditLogger");

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_API_KEY,
});

// Model: Qwen2.5-72B is reliable for tool/function calling on HF free tier.
// Alternatives: "meta-llama/Llama-3.3-70B-Instruct", "mistralai/Mistral-7B-Instruct-v0.3"
const MODEL = "Qwen/Qwen2.5-72B-Instruct";

// ── Tool definitions ───────────────────────────────────────────
const tools = [
  {
    name: "get_platform_stats",
    description: "Returns live statistics: total users, bookings, pending/delivered counts, risk tier breakdown (GREEN/YELLOW/RED), DLE count, and current Merkle root.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_audit_log",
    description: "Returns Decision Log Entries (DLEs) — cryptographic records of every AI agent decision. Includes fraud scores, risk tiers, confidence, and reasoning summaries.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max entries to return. Default 20." },
        agent_filter: { type: "string", description: "Filter by 'booking-agent' or 'scoring-agent'. Omit for all." },
      },
    },
  },
  {
    name: "get_overridden_decisions",
    description: "Returns only DLE entries that were manually overridden by an admin, with before/after values and justification reasons.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "search_by_trace_id",
    description: "Returns all DLE entries belonging to a specific session trace ID.",
    parameters: {
      type: "object",
      required: ["trace_id"],
      properties: {
        trace_id: { type: "string", description: "The session trace ID to look up." },
      },
    },
  },
  {
    name: "get_high_risk_bookings",
    description: "Returns bookings flagged as RED tier (risk_tier=2) with wallet addresses, fraud scores, and delivery statuses.",
    parameters: { type: "object", properties: {} },
  },
];

// ── Tool executor ──────────────────────────────────────────────
function executeTool(name, args) {
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
    if (args.agent_filter) entries = entries.filter((e) => e.agent_id === args.agent_filter);
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

You have real-time access to tools that can read from the blockchain audit system:
- Platform statistics (users, bookings, risk tier distributions)
- Decision Log Entries (DLEs) — cryptographic records of every AI decision
- Manual override history with before/after diffs
- Fraud scores and risk tier classifications (GREEN/YELLOW/RED)
- Merkle root of the cryptographic audit chain

Guidelines:
- Always use tools to fetch live data before answering statistical questions
- Be concise but insightful — highlight anomalies or concerning patterns
- Explain technical terms clearly when asked (Merkle root, DLE, AAEP, risk tiers)
- Format numbers cleanly (e.g. "47% of bookings are GREEN tier")
- Never fabricate data — only report what the tools return
- Keep responses under 300 words unless a detailed report is explicitly requested`;

// ── OpenAI-format tool declarations ───────────────────────────
// (same tool logic as above, just wrapped in OpenAI function-calling schema)
const openAITools = tools.map((t) => ({
  type: "function",
  function: {
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  },
}));

// ── Main chat function ─────────────────────────────────────────
async function chat(history, userMessage) {
  // Build message array in OpenAI format
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
    { role: "user", content: userMessage },
  ];

  // Agentic loop: keep calling the model until it returns a text response
  while (true) {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools: openAITools,
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    messages.push(choice.message); // append assistant turn

    // If no tool calls → we have the final text answer
    if (!choice.message.tool_calls || choice.message.tool_calls.length === 0) {
      return choice.message.content;
    }

    // Execute every requested tool call and push results back
    for (const tc of choice.message.tool_calls) {
      let args = {};
      try { args = JSON.parse(tc.function.arguments || "{}"); } catch {}
      const result = executeTool(tc.function.name, args);
      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }
  }
}

module.exports = { chat };
```

---

## Step 4 — Add `/chat` Route to `backend/routes/api.js`

**Append** these lines just before `module.exports = router;` at the bottom of `api.js`:

```javascript
// ── AI Chatbot ─────────────────────────────────────────────────
const { chat } = require("../agents/chatAgent");

router.post("/chat", async (req, res) => {
  try {
    const { history = [], message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message required" });
    const reply = await chat(history, message);
    res.json({ reply });
  } catch (e) {
    console.error("[ChatAgent]", e.message);
    res.status(500).json({ error: "AI agent unavailable: " + e.message });
  }
});
```

---

## Step 5 — Create `frontend/src/components/AdminChatbot.jsx`

Create `gassafe/frontend/src/components/AdminChatbot.jsx`:

```jsx
import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, MessageSquare, Loader2, ChevronDown } from "lucide-react";

const API = "http://localhost:3001/api";

const SUGGESTIONS = [
  "How many high-risk bookings are there?",
  "Summarize the audit trail",
  "Are there any overridden decisions?",
  "What is the current Merkle root?",
  "Show me the last 10 fraud scores",
];

function Message({ msg }) {
  const isBot = msg.role === "assistant";
  return (
    <div className={`chat-msg ${isBot ? "chat-msg-bot" : "chat-msg-user"}`}>
      {isBot && (
        <div className="chat-avatar">
          <Bot size={14} />
        </div>
      )}
      <div className={`chat-bubble ${isBot ? "chat-bubble-bot" : "chat-bubble-user"}`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AdminChatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm GasSafe Compliance AI. I can query audit logs, risk tiers, fraud scores, and blockchain state in natural language. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  async function sendMessage(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;

    setInput("");
    const newHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: newHistory.slice(0, -1),
          message: userMsg,
        }),
      });
      const data = await res.json();
      setMessages([...newHistory, { role: "assistant", content: data.reply || data.error }]);
    } catch {
      setMessages([
        ...newHistory,
        { role: "assistant", content: "Connection error. Is the backend running?" },
      ]);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          id="chatbot-open-btn"
          className="chat-fab"
          onClick={() => setOpen(true)}
          title="Open Compliance AI"
        >
          <MessageSquare size={22} />
          <span className="chat-fab-label">Ask AI</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className={`chat-panel ${minimized ? "chat-panel-mini" : ""}`}>
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-avatar">
                <Bot size={16} />
              </div>
              <div>
                <div className="chat-header-name">Compliance AI</div>
                <div className="chat-header-status">
                  <span className="chat-dot" />
                  Live blockchain access
                </div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button onClick={() => setMinimized(!minimized)} className="chat-icon-btn">
                {minimized ? <ChevronDown size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={() => setOpen(false)} className="chat-icon-btn">
                <X size={16} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              <div className="chat-body">
                {messages.map((m, i) => (
                  <Message key={i} msg={m} />
                ))}
                {loading && (
                  <div className="chat-msg chat-msg-bot">
                    <div className="chat-avatar">
                      <Bot size={14} />
                    </div>
                    <div className="chat-bubble chat-bubble-bot chat-typing">
                      <Loader2 size={14} className="spin" />
                      <span>Querying blockchain data…</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {messages.length === 1 && (
                <div className="chat-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="chat-chip" onClick={() => sendMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="chat-footer">
                <input
                  id="chatbot-input"
                  className="chat-input"
                  placeholder="Ask about audit logs, risk tiers, fraud scores…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                />
                <button
                  id="chatbot-send-btn"
                  className="chat-send"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
```

---

## Step 6 — Add CSS to `frontend/src/main.css`

**Append** this entire block to the very end of `main.css` — do not modify anything above it:

```css
/* ================================================================
   ADMIN CHATBOT STYLES
   ================================================================ */

.chat-fab {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s, box-shadow 0.2s;
}
.chat-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
}

.chat-panel {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
  width: 400px;
  max-height: 620px;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.14);
  overflow: hidden;
  animation: chat-slide-in 0.25s ease;
}
.chat-panel-mini { max-height: unset; }
@keyframes chat-slide-in {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--brand-primary);
  color: white;
  flex-shrink: 0;
}
.chat-header-info { display: flex; align-items: center; gap: 10px; }
.chat-header-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex; align-items: center; justify-content: center;
}
.chat-header-name { font-weight: 700; font-size: 14px; }
.chat-header-status { display: flex; align-items: center; gap: 6px; font-size: 11px; opacity: 0.85; }
.chat-dot {
  width: 6px; height: 6px;
  background: #86efac;
  border-radius: 50%;
  animation: chat-pulse 2s infinite;
}
.chat-header-actions { display: flex; gap: 4px; }
.chat-icon-btn {
  background: none; border: none; color: white; opacity: 0.8;
  cursor: pointer; padding: 4px; border-radius: 6px;
  display: flex; align-items: center;
  transition: opacity 0.2s, background 0.2s;
}
.chat-icon-btn:hover { opacity: 1; background: rgba(255, 255, 255, 0.15); }

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 300px;
  max-height: 400px;
  background: var(--bg-secondary);
}
.chat-msg { display: flex; align-items: flex-start; gap: 8px; }
.chat-msg-bot { flex-direction: row; }
.chat-msg-user { flex-direction: row-reverse; }
.chat-avatar {
  width: 28px; height: 28px; flex-shrink: 0;
  border-radius: 50%;
  background: var(--brand-primary);
  color: white;
  display: flex; align-items: center; justify-content: center;
}
.chat-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}
.chat-bubble-bot {
  background: white;
  border: 1px solid var(--border-primary);
  border-bottom-left-radius: 4px;
  color: var(--text-primary);
}
.chat-bubble-user {
  background: var(--brand-primary);
  color: white;
  border-bottom-right-radius: 4px;
}
.chat-typing { display: flex; align-items: center; gap: 8px; color: var(--text-tertiary); font-style: italic; }

.chat-suggestions {
  padding: 10px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
}
.chat-chip {
  padding: 5px 10px;
  background: white;
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  font-size: 11px;
  color: var(--brand-primary);
  cursor: pointer;
  font-weight: 500;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.chat-chip:hover { background: var(--brand-primary); color: white; border-color: var(--brand-primary); }

.chat-footer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--border-primary);
  background: white;
  flex-shrink: 0;
}
.chat-input {
  flex: 1;
  padding: 9px 14px;
  border: 1px solid var(--border-primary);
  border-radius: 22px;
  font-size: 13px;
  outline: none;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-secondary);
  transition: border-color 0.2s;
}
.chat-input:focus { border-color: var(--brand-primary); }
.chat-input:disabled { opacity: 0.5; }
.chat-send {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: var(--brand-primary);
  color: white;
  border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.2s, transform 0.15s;
}
.chat-send:hover:not(:disabled) { transform: scale(1.08); }
.chat-send:disabled { opacity: 0.4; cursor: not-allowed; }

@keyframes chat-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

---

## Step 7 — Edit `AdminUI.jsx` (2 lines only)

### Change 1 — Add import (after line 3):
```jsx
import AdminChatbot from "../components/AdminChatbot";
```

### Change 2 — Render component (just before the final `</div>` at line 407):
```jsx
    <AdminChatbot />
  </div>
```

### Full diff:
```diff
 import { useState, useEffect } from "react";
 import axios from "axios";
 import { Users, Package, ... } from "lucide-react";
+import AdminChatbot from "../components/AdminChatbot";
```

```diff
-  </div>
+  <AdminChatbot />
+</div>
 );
```

> The chatbot uses `position: fixed` so it floats over the UI with **zero effect** on existing layout, scroll, stat grid, or tabs.

---

## Step 8 — Verify dotenv is loaded

Open your root `server.js` and ensure the very first line is:

```javascript
require("dotenv").config();
```

This is already present in most Express setups. If it's missing, add it before any other `require()` calls.

---

## Chatbot Capabilities (Example Queries)

| Question | Tool Used | What Happens |
|---|---|---|
| "How many users do we have?" | `get_platform_stats` | Returns live count from db.json |
| "Show me all RED tier bookings" | `get_high_risk_bookings` | Lists fraud-flagged bookings |
| "Were any audit decisions overridden?" | `get_overridden_decisions` | Returns override history |
| "What is the current Merkle root?" | `get_platform_stats` | Computes live Merkle root |
| "Summarize the last 5 audit decisions" | `get_audit_log` | Returns latest DLEs |
| "Investigate trace ID abc-123" | `search_by_trace_id` | Finds all DLEs for a session |
| "Is there anything suspicious in the logs?" | `get_audit_log` + reasoning | AI analyzes anomalies |

---

## File Change Summary

```
gassafe/
├── .env                                      ← APPEND: HF_API_KEY=...
├── backend/
│   ├── agents/
│   │   └── chatAgent.js                      ← NEW FILE
│   └── routes/
│       └── api.js                            ← APPEND 5 lines before module.exports
└── frontend/src/
    ├── components/
    │   └── AdminChatbot.jsx                  ← NEW FILE
    ├── main.css                              ← APPEND css block to end of file
    └── pages/
        └── AdminUI.jsx                       ← +1 import line, +1 component render
```

> **Tip:** You can swap `Qwen/Qwen2.5-72B-Instruct` for `meta-llama/Llama-3.3-70B-Instruct` or `mistralai/Mistral-Small-3.1-24B-Instruct-2503` in the `MODEL` constant inside `chatAgent.js`. All are supported on the HF free Inference API and handle function/tool calling well.
