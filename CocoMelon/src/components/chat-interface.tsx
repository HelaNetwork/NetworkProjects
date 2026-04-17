"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import type { ChatMessage } from "@/lib/types";

interface ChatInterfaceProps {
  matchId: string;
  recipientAddress: string;
  recipientName: string;
  recipientImage: string;
  currentAddress: string;
}

export function ChatInterface({
  matchId,
  recipientAddress,
  recipientName,
  recipientImage,
  currentAddress,
}: ChatInterfaceProps) {
  const { sendMessage, getDecryptedMessages, isSending } = useChat(matchId);
  const [input, setInput] = useState("");
  const [decryptedMessages, setDecryptedMessages] = useState<
    (ChatMessage & { decrypted: string })[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    getDecryptedMessages(recipientAddress).then((msgs) => {
      if (!cancelled) setDecryptedMessages(msgs);
    });
    return () => { cancelled = true; };
  }, [getDecryptedMessages, recipientAddress]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [decryptedMessages]);

  async function handleSend() {
    if (!input.trim() || isSending) return;
    const msg = input;
    setInput("");
    await sendMessage(msg, recipientAddress);
    const msgs = await getDecryptedMessages(recipientAddress);
    setDecryptedMessages(msgs);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="glass-strong px-4 py-3 flex items-center gap-3 border-b border-glass-border">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyber-pink/50">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${recipientImage})` }}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">{recipientName}</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-cyber-green">
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-glow-pulse" />
            End-to-end encrypted
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-[10px] font-medium text-cyber-blue">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          E2E
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {decryptedMessages.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-cyber-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              Messages are encrypted end-to-end. Start a conversation with {recipientName}.
            </p>
          </motion.div>
        )}

        {decryptedMessages.map((msg, i) => {
          const isOwn = msg.senderHash === currentAddress;
          return (
            <motion.div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isOwn
                    ? "bg-linear-to-br from-cyber-pink to-cyber-purple text-white rounded-br-md"
                    : "glass text-gray-200 rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.decrypted}</p>
                <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "justify-end" : ""}`}>
                  <span className="text-[10px] opacity-60">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {msg.proofHash && (
                    <svg className="w-2.5 h-2.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 glass-strong border-t border-glass-border">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-dark-700/50! rounded-full! px-5! py-3! text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="w-12 h-12 rounded-full bg-linear-to-br from-cyber-pink to-cyber-purple flex items-center justify-center text-white transition-all hover:shadow-[0_0_20px_rgba(255,45,149,0.4)] hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-gray-600">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Encrypted with AES-256-GCM &middot; Proof stored on-chain
        </div>
      </div>
    </div>
  );
}
