import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot, Send, X, Minimize2, MessageSquare, Loader2,
  ChevronDown, ChevronRight, Wrench, BarChart2, FileText,
  AlertTriangle, Search, Database
} from "lucide-react";


const API = "http://localhost:3001/api";

const SUGGESTIONS = [
  "How many high-risk bookings are there?",
  "Summarize the audit trail",
  "Are there any overridden decisions?",
  "What is the current Merkle root?",
  "Show me the last 5 fraud scores",
];

// Map tool name → friendly label + icon
const TOOL_META = {
  get_platform_stats:      { label: "Fetched platform stats",       Icon: BarChart2 },
  get_audit_log:           { label: "Queried audit log",            Icon: FileText },
  get_overridden_decisions:{ label: "Checked override history",     Icon: AlertTriangle },
  search_by_trace_id:      { label: "Searched by trace ID",         Icon: Search },
  get_high_risk_bookings:  { label: "Fetched high-risk bookings",   Icon: Database },
};

function argSummary(name, args) {
  if (name === "get_audit_log") {
    const parts = [];
    if (args.limit)        parts.push(`limit ${args.limit}`);
    if (args.agent_filter) parts.push(args.agent_filter);
    return parts.length ? `(${parts.join(", ")})` : "";
  }
  if (name === "search_by_trace_id" && args.trace_id) {
    return `(${String(args.trace_id).slice(0, 12)}…)`;
  }
  return "";
}

// Collapsible tool-call activity row
function ToolActivity({ calls }) {
  const [open, setOpen] = useState(false);
  if (!calls || calls.length === 0) return null;

  return (
    <div className="tool-activity">
      <button className="tool-activity-header" onClick={() => setOpen(o => !o)}>
        <Wrench size={11} />
        <span>{calls.length} tool call{calls.length > 1 ? "s" : ""} executed</span>
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </button>
      {open && (
        <div className="tool-activity-list">
          {calls.map((tc, i) => {
            const meta = TOOL_META[tc.name] || { label: tc.name, Icon: Wrench };
            const summary = argSummary(tc.name, tc.args || {});
            return (
              <div key={i} className="tool-activity-item">
                <meta.Icon size={11} />
                <span className="tool-activity-name">{meta.label}</span>
                {summary && <span className="tool-activity-args">{summary}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Message({ msg }) {
  const isBot = msg.role === "assistant";
  return (
    <div className={`chat-msg-wrap ${isBot ? "chat-msg-wrap-bot" : "chat-msg-wrap-user"}`}>
      {/* Tool calls shown above the bot response */}
      {isBot && msg.toolCalls?.length > 0 && (
        <ToolActivity calls={msg.toolCalls} />
      )}
      <div className={`chat-msg ${isBot ? "chat-msg-bot" : "chat-msg-user"}`}>
        {isBot && (
          <div className="chat-avatar">
            <Bot size={14} />
          </div>
        )}
        <div className={`chat-bubble ${isBot ? "chat-bubble-bot" : "chat-bubble-user"}`}>
          {isBot
            ? <ReactMarkdown className="chat-md">{msg.content}</ReactMarkdown>
            : msg.content
          }
        </div>
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
      toolCalls: [],
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
    const newHistory = [...messages, { role: "user", content: userMsg, toolCalls: [] }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // send only role + content for the history (not toolCalls meta)
          history: newHistory.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          message: userMsg,
        }),
      });
      const data = await res.json();
      setMessages([
        ...newHistory,
        {
          role: "assistant",
          content: data.reply || data.error || "No response received.",
          toolCalls: data.toolCalls || [],
        },
      ]);
    } catch {
      setMessages([
        ...newHistory,
        {
          role: "assistant",
          content: "Connection error. Is the backend running on port 3001?",
          toolCalls: [],
        },
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
          {/* Header */}
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
              <button
                onClick={() => setMinimized(!minimized)}
                className="chat-icon-btn"
                title={minimized ? "Expand" : "Minimize"}
              >
                {minimized ? <ChevronDown size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={() => setOpen(false)} className="chat-icon-btn" title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body + input — hidden when minimized */}
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

              {/* Quick suggestion chips — only on first message */}
              {messages.length === 1 && (
                <div className="chat-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="chat-chip" onClick={() => sendMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input row */}
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
