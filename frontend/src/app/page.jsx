'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import WalletConnect from '@/components/WalletConnect';
import TransactionPreview from '@/components/TransactionPreview';
import RiskMeter from '@/components/RiskMeter';
import ChatAssistant from '@/components/ChatAssistant';
import SimulatorPanel from '@/components/SimulatorPanel';
import SafetyRecommendations from '@/components/SafetyRecommendations';
import { analyzeTransaction, simulateTransaction } from '@/lib/api';
import { Shield, Zap, MessageSquare, Search, ArrowRight, Lock, Eye, Bot } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = useCallback(async (txData) => {
    setIsAnalyzing(true);
    setIsSimulating(true);
    setError(null);

    try {
      const [analysis, simulation] = await Promise.all([
        analyzeTransaction(txData),
        simulateTransaction(txData),
      ]);
      setAnalysisResult(analysis);
      setSimulationResult(simulation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze. Is the backend running on port 3001?');
    } finally {
      setIsAnalyzing(false);
      setIsSimulating(false);
    }
  }, []);

  const transactionContext = analysisResult ? {
    functionName: analysisResult.decoded.functionName,
    to: analysisResult.decoded.args?.to,
    contractInfo: analysisResult.decoded.contractInfo,
    valueEth: analysisResult.decoded.valueEth,
    riskLevel: analysisResult.risk.level,
    riskScore: analysisResult.risk.score,
    flags: analysisResult.decoded.flags,
  } : null;

  /* ── Feature cards ── */
  const features = [
    {
      icon: <Search className="w-5 h-5" />,
      title: 'Transaction Explainer',
      desc: 'Decode transactions into simple, human-readable explanations.',
      color: '#3b82f6',
      tab: 'analyze',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Signing Simulator',
      desc: 'Preview balance changes and hidden interactions before signing.',
      color: '#8b5cf6',
      tab: 'simulate',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Risk Detection',
      desc: 'Automated threat scoring for approvals, scams, and phishing.',
      color: '#10b981',
      tab: 'analyze',
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'AI Chat',
      desc: 'Ask any blockchain safety question, get clear answers.',
      color: '#22d3ee',
      tab: 'chat',
    },
  ];

  return (
    <main className="relative min-h-screen" style={{ paddingTop: '72px' }}>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Error Banner ── */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <div
            className="p-4 rounded-xl flex items-center gap-3"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <span className="text-base">⚠️</span>
            <p className="text-sm flex-1" style={{ color: '#fca5a5' }}>{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          DASHBOARD
          ============================================================ */}
      {activeTab === 'dashboard' && (
        <div className="max-w-4xl mx-auto px-6 py-12">

          {/* ── Hero ── */}
          <section className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.18)',
              }}
            >
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--accent-purple)' }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--accent-cyan)' }}
              >
                AI-Powered Protection
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight leading-[1.15] text-gradient"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Shield Your Wallet
            </h1>

            <p
              className="text-base max-w-lg mx-auto leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Understand every transaction before you sign. AI-powered analysis,
              scam detection, and safety advice — in plain English.
            </p>

            {/* CTA buttons */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setActiveTab('analyze')}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-sm"
              >
                <Search className="w-4 h-4" />
                Analyze a Transaction
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className="btn-secondary flex items-center gap-2 px-6 py-3 text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Ask ShieldAI
              </button>
            </div>
          </section>

          {/* ── Feature Cards — 2x2 grid ── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
            {features.map((f, i) => (
              <button
                key={i}
                id={`feature-card-${i}`}
                onClick={() => setActiveTab(f.tab)}
                className="feature-card text-left group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${f.color}14`,
                      color: f.color,
                      border: `1px solid ${f.color}22`,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-sm font-bold mb-1"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className="text-[13px] leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {f.desc}
                    </p>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: f.color }}
                  />
                </div>
              </button>
            ))}
          </section>

          {/* ── Trust Strip ── */}
          <section
            className="flex flex-wrap items-center justify-center gap-6 py-5"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            {[
              { icon: <Lock className="w-3.5 h-3.5" />, text: 'No private keys stored' },
              { icon: <Eye className="w-3.5 h-3.5" />, text: 'Read-only analysis' },
              { icon: <Shield className="w-3.5 h-3.5" />, text: 'Open source' },
              { icon: <Bot className="w-3.5 h-3.5" />, text: 'AI-powered insights' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: 'var(--accent-cyan)' }}>{item.icon}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* ============================================================
          ANALYZE TAB
          ============================================================ */}
      {activeTab === 'analyze' && (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Transaction Analyzer
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Select a sample or paste raw transaction data to analyze
            </p>
          </div>

          {/* Two columns: Wallet + Transaction input */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2">
              <WalletConnect />
            </div>
            <div className="lg:col-span-3">
              <div className="glass-card p-5">
                <TransactionPreview
                  onAnalyze={handleAnalyze}
                  isLoading={isAnalyzing}
                  result={null}
                />
              </div>
            </div>
          </div>

          {/* Loading */}
          {isAnalyzing && (
            <div className="glass-card p-10 text-center">
              <div className="spinner mx-auto mb-4" style={{ width: 36, height: 36 }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Analyzing transaction...
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Decoding calldata, scoring risks, generating AI insights
              </p>
            </div>
          )}

          {/* Results */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-5">
              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
                <span
                  className="text-[11px] font-bold uppercase tracking-widest px-3"
                  style={{ color: 'var(--accent-cyan)' }}
                >
                  Results
                </span>
                <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
              </div>

              {/* Decoded + Risk */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3 glass-card p-5">
                  <h3
                    className="text-sm font-bold mb-3 flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                  >
                    Decoded Transaction
                    <span
                      className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold ml-auto"
                      style={{
                        background: analysisResult.decoded.decodedSuccessfully
                          ? 'rgba(16,185,129,0.12)'
                          : 'rgba(239,68,68,0.12)',
                        color: analysisResult.decoded.decodedSuccessfully
                          ? 'var(--accent-green)'
                          : 'var(--accent-red)',
                      }}
                    >
                      {analysisResult.decoded.decodedSuccessfully ? '✓ Decoded' : '✗ Unknown'}
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    <InfoCard label="Function" value={analysisResult.decoded.functionName || 'Unknown'} />
                    <InfoCard label="Category" value={analysisResult.decoded.category} />
                    <InfoCard label="ETH Value" value={`${analysisResult.decoded.valueEth} ETH`} />
                    <InfoCard label="Contract" value={analysisResult.decoded.contractInfo?.name || 'Unknown'} />
                  </div>
                  {analysisResult.decoded.flags.length > 0 && (
                    <div className="space-y-1.5">
                      {analysisResult.decoded.flags.map((flag, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg text-sm"
                          style={{
                            background: flag.type === 'danger' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
                            border: `1px solid ${flag.type === 'danger' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)'}`,
                          }}
                        >
                          <span className="text-sm mt-px">{flag.type === 'danger' ? '🚨' : '⚠️'}</span>
                          <span className="text-[13px]" style={{ color: flag.type === 'danger' ? '#fca5a5' : '#fcd34d' }}>
                            {flag.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <RiskMeter
                    score={analysisResult.risk.score}
                    level={analysisResult.risk.level}
                    threats={analysisResult.risk.threats}
                  />
                </div>
              </div>

              {/* Simulation + Safety */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <SimulatorPanel result={simulationResult} isLoading={isSimulating} />
                <SafetyRecommendations
                  recommendations={analysisResult.risk.recommendations}
                  aiExplanation={analysisResult.ai.explanation}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          SIMULATE TAB
          ============================================================ */}
      {activeTab === 'simulate' && (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Transaction Simulator
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Preview balance changes, approvals, and hidden interactions before signing
            </p>
          </div>

          <div className="glass-card p-5">
            <TransactionPreview
              onAnalyze={handleAnalyze}
              isLoading={isAnalyzing}
              result={null}
            />
          </div>

          {isAnalyzing && (
            <div className="glass-card p-10 text-center">
              <div className="spinner mx-auto mb-4" style={{ width: 36, height: 36 }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Simulating transaction...
              </p>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <SimulatorPanel result={simulationResult} isLoading={false} />
                <RiskMeter
                  score={analysisResult.risk.score}
                  level={analysisResult.risk.level}
                  threats={analysisResult.risk.threats}
                />
              </div>
              <SafetyRecommendations
                recommendations={analysisResult.risk.recommendations}
                aiExplanation={analysisResult.ai.explanation}
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          CHAT TAB
          ============================================================ */}
      {activeTab === 'chat' && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-5">
              <WalletConnect />
              {analysisResult && (
                <RiskMeter
                  score={analysisResult.risk.score}
                  level={analysisResult.risk.level}
                  threats={analysisResult.risk.threats}
                />
              )}
              <div className="glass-card p-4">
                <h3
                  className="text-xs font-bold mb-2.5 uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
                >
                  Suggested Questions
                </h3>
                <div className="space-y-1.5">
                  {[
                    "What is an unlimited token approval?",
                    "How do I revoke token approvals?",
                    "What makes a smart contract risky?",
                    "What is a rug pull?",
                    "How to use a hardware wallet?",
                  ].map((q) => (
                    <p
                      key={q}
                      className="p-2.5 rounded-lg text-[13px]"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-card)',
                      }}
                    >
                      {q}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="lg:col-span-2">
              <ChatAssistant transactionContext={transactionContext} />
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer
        className="max-w-4xl mx-auto px-6 mt-6 py-5 text-center"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          ShieldAI Wallet Guardian · Read-only analysis · No private keys stored ·{' '}
          <span style={{ color: 'var(--accent-cyan)' }}>Built for your safety</span>
        </p>
      </footer>
    </main>
  );
}

/* ── Helper: Info card for decoded details ── */
function InfoCard({ label, value }) {
  return (
    <div
      className="p-2.5 rounded-lg"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-card)' }}
    >
      <p
        className="text-[10px] uppercase tracking-wider font-semibold mb-0.5"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <p
        className="text-[13px] font-bold truncate"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}
