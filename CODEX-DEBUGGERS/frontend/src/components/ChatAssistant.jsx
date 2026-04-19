'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { chatWithAssistant } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

export default function ChatAssistant({ transactionContext }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey there! 👋 I'm **ShieldAI**, your blockchain security assistant.\n\nI can help you:\n- 🔍 Understand transactions\n- 🛡️ Assess risks\n- 💡 Answer Web3 safety questions\n\nTry asking me something!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history (exclude welcome message)
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map(({ role, content }) => ({ role, content }));

      const response = await chatWithAssistant(trimmed, history, transactionContext || null);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.response,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I couldn't process that right now. Please make sure the backend server is running on port 3001.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Chat cleared! 🧹 How can I help you?",
      },
    ]);
  };

  const quickQuestions = [
    "Is this transaction safe?",
    "What are token approvals?",
    "How to stay safe in DeFi?",
    "What is a rug pull?",
  ];

  return (
    <div
      id="chat-widget"
      className="glass-card flex flex-col"
      style={{ height: '520px', minWidth: '320px' }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border-card)' }}
      >
        <div className="flex items-center gap-3">
          {/* ShieldAI avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--gradient-cyber)' }}
          >
            <Bot className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              ShieldAI
            </p>
            <div className="flex items-center gap-1.5">
              {/* Online dot with pulse */}
              <div
                className="w-1.5 h-1.5 rounded-full animate-status-pulse"
                style={{ background: 'var(--accent-green)' }}
              />
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Online
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* ── Messages Area ── */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex gap-2.5 max-w-[88%]">
              {/* AI avatar */}
              {msg.role === 'assistant' && (
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-cyan)' }} />
                </div>
              )}

              {/* Message bubble */}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai ai-content'}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>

              {/* User avatar */}
              {msg.role === 'user' && (
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-card)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div className="chat-bubble-ai flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--accent-cyan)', animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--accent-cyan)', animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--accent-cyan)', animationDelay: '300ms' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Quick Questions (shown early in conversation) ── */}
      {messages.length <= 2 && (
        <div className="px-5 pb-2 flex flex-wrap gap-1.5">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="text-[11px] px-3 py-1.5 rounded-full transition-all duration-200"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.color = 'var(--accent-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-card)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Area ── */}
      <div className="px-5 pb-4 pt-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about blockchain safety..."
            className="input-field flex-1"
            style={{ fontFamily: 'inherit', fontSize: '13px' }}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-primary px-4 flex items-center justify-center"
            style={{ opacity: !input.trim() || isLoading ? 0.4 : 1 }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
