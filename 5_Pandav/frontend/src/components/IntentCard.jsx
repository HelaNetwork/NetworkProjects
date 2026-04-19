import React, { useState } from 'react';
import { Shield, Clock, Hash, ArrowUpRight, CheckCircle2, Bot } from 'lucide-react';
import { useToast } from './Toast';
import { RiskBadge } from './RiskBadge';
import './IntentCard.css';

function truncateAddress(address, start = 6, end = 4) {
  if (address === null || address === undefined) return "";
  const str = String(address);
  if (str.length <= start + end) return str;
  return `${str.slice(0, start)}...${str.slice(-end)}`;
}

export function IntentCard({
  intent,
  onVerified,
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    // In a real app we'd verify the wallet here. 
    // We'll simulate the API call and verification.
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/audit/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audit_id: String(intent.id),
          verifier_address: "0xMockGuardian", // We'd get this from Web3Modal
          signature: "0xMockSignature"
        }),
      });
      
      if (!response.ok) {
        throw new Error('Verification failed');
      }
      
      setLoading(false);
      setVerified(true);
      toast.success("Intent verified & released", "Signed by guardian");
      setTimeout(() => onVerified?.(intent.id), 600);
    } catch (error) {
      setLoading(false);
      toast.error("Verification failed", error.message);
    }
  };

  return (
    <article className="intent-card glass hover-lift">
      {/* Header */}
      <div className="intent-header">
        <div className="intent-action-badge">
          <Bot className="intent-action-icon" size={12} />
          {intent.action}
        </div>
        <RiskBadge score={intent.riskScore} />
      </div>

      {/* Amount */}
      <div className="intent-amount-section">
        <p className="intent-label">Value at risk</p>
        <div className="intent-amount-display">
          <span className="intent-amount">{intent.amount}</span>
          <span className="intent-asset">{intent.asset}</span>
        </div>
      </div>

      {/* Agent reason */}
      <div className="intent-reason-section">
        <p className="intent-label">Agent's stated reason</p>
        <p className="intent-reason-text">"{intent.agentReason}"</p>
      </div>

      {/* AI Auditor Assessment */}
      <div className="intent-auditor-section bg-gradient-brand-soft">
        <div className="intent-auditor-header">
          <div className="intent-shield-icon-wrapper">
            <Shield className="intent-shield-icon text-accent-light" size={14} strokeWidth={2.5} />
          </div>
          <span className="intent-auditor-title text-accent-light">AI Auditor Assessment</span>
        </div>
        <p className="intent-auditor-text">{intent.auditorAssessment}</p>
      </div>

      {/* Footer */}
      <div className="intent-footer">
        <div className="intent-meta">
          <span className="intent-meta-item">
            <Clock size={12} />
            {intent.timestamp}
          </span>
          <span className="intent-meta-item mono">
            <Hash size={12} />
            {truncateAddress(intent.id, 6, 6)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || verified}
          className="intent-verify-btn bg-gradient-brand hover-glow-indigo"
        >
          <span aria-hidden="true" className="btn-shimmer" />
          {loading ? (
            <>
              <span className="spinner" />
              Signing
            </>
          ) : verified ? (
            <>
              <CheckCircle2 size={14} />
              Released
            </>
          ) : (
            <>
              Verify & Release
              <ArrowUpRight size={14} className="verify-arrow" />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
