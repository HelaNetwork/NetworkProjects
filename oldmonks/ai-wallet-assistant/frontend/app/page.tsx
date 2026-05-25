"use client";

import { useState, FormEvent } from 'react';
import { saveAnalysis, createAnalysis, getAnalysisById } from '@/lib/history';
import Link from 'next/link';

interface AnalysisResult {
  summary: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: {
    simple: string;
    technical: string;
  } | string;
}

interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
}

export default function Home() {
  const [transactionData, setTransactionData] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const RISKY_EXAMPLE = `Approve unlimited USDT tokens to suspicious contract 0xdeadbeef... This could drain your wallet!`;

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!transactionData.trim()) {
      setError('Please enter transaction data');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_data: transactionData }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data: AnalysisResult = await response.json();
      setResult(data);

      // Auto-save to history
      const statusMap = {
        LOW: 'Safe' as const,
        MEDIUM: 'Warning' as const,
        HIGH: 'Critical' as const,
        CRITICAL: 'Critical' as const,
      };
      const analysis = createAnalysis(
        transactionData,
        {
          status: statusMap[data.risk_level as keyof typeof statusMap] || 'Warning',
          summary: data.summary,
          details: typeof data.explanation === 'object' 
            ? `${data.explanation.simple}\n\nTechnical: ${data.explanation.technical}`
            : data.explanation,
        }
      );
      saveAnalysis(analysis);
      setCurrentAnalysisId(analysis.id);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Start backend: cd ai-wallet-assistant/backend && node index.js');
    } finally {
      setLoading(false);
    }
  };


  const handleTryExample = () => {
    setTransactionData(RISKY_EXAMPLE);
    setError('');
  };

  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { type: 'user', text: chatInput };
    const tempMessages = [...chatMessages, userMessage];
    setChatMessages(tempMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: chatInput,
          transaction_data: result ? transactionData : undefined 
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      const aiMessage: ChatMessage = { type: 'ai', text: data.reply || 'No response' };
      const newMessages = [...tempMessages, aiMessage];
      setChatMessages(newMessages);

      // Append to analysis chatHistory if result exists
      if (result && transactionData && currentAnalysisId) {
        const existing = getAnalysisById(currentAnalysisId);
        if (existing) {
          existing.chatHistory = newMessages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            message: m.text
          }));
          saveAnalysis(existing);
        }
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = { type: 'ai', text: `Error: ${err.message}. Backend must be running.` };
      setChatMessages([...tempMessages, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };


  const getRiskStyle = (risk: string) => {
    const styles = {
      LOW: { backgroundColor: '#16a34a', color: 'white' },
      MEDIUM: { backgroundColor: 'orange', color: 'black' },
      HIGH: { backgroundColor: '#dc2626', color: 'white' }
    };
    return styles[risk as keyof typeof styles] || { backgroundColor: 'gray', color: 'white' };
  };

  return (
    <main style={{
      minHeight: '100vh',
      padding: '4rem 2rem',
      backgroundColor: '#f5f5f5',
      fontFamily: '"Arial Black", Arial, sans-serif',
      lineHeight: 1.4
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        border: '5px solid black',
        backgroundColor: 'white',
        boxShadow: '10px 10px 0 black',
        rotate: '1deg'
      }}>
        {/* Header */}
        <div style={{
          padding: '2rem 3rem',
          borderBottom: '5px solid black',
          backgroundColor: '#fff',
          textAlign: 'center',
          margin: '-5px -5px 0 -5px'
        }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '900',
            color: 'black',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: 0,
            fontFamily: '"Arial Black", sans-serif'
          }}>
            AI WALLET ASSISTANT
          </h1>
          <p style={{
            fontSize: '1.5rem',
            color: 'black',
            fontWeight: 'bold',
            margin: '1rem 0 0 0',
            fontFamily: 'monospace'
          }}>
            BRUTAL TRANSACTION ANALYSIS
          </p>

          <div style={{ marginTop: '2rem' }}>
            <Link href="/login" style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              backgroundColor: '#00f5ff',
              color: 'black',
              border: '4px solid black',
              boxShadow: '6px 6px 0 black',
              fontWeight: '900',
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontSize: '1.2rem',
              transition: 'all 0.1s'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(4px, 4px)';
              e.currentTarget.style.boxShadow = '2px 2px 0 black';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '6px 6px 0 black';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '6px 6px 0 black';
            }}>
              🔗 CONNECT WALLET
            </Link>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          padding: '3rem'
        }}>
          {/* Analysis Panel */}
          <div style={{
            border: '4px solid black',
            backgroundColor: '#fff',
            boxShadow: '8px 8px 0 black',
            rotate: '0.5deg',
            padding: '2rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: 'black',
              margin: '0 0 1.5rem 0',
              borderBottom: '3px solid black',
              paddingBottom: '0.5rem',
              fontFamily: '"Arial Black", sans-serif'
            }}>
              ANALYZE TX
            </h2>

            <button
              onClick={handleTryExample}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#ffd700',
                color: 'black',
                border: '4px solid black',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                fontFamily: '"Arial Black", sans-serif',
                cursor: 'pointer',
                boxShadow: '6px 6px 0 black',
                marginBottom: '2rem',
                transition: 'all 0.1s'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(4px, 4px)';
                e.currentTarget.style.boxShadow = '2px 2px 0 black';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '6px 6px 0 black';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '6px 6px 0 black';
              }}
            >
              LOAD DANGER EXAMPLE
            </button>

            <form onSubmit={handleAnalyze} style={{ marginBottom: '2rem' }}>
              <textarea
                value={transactionData}
                onChange={(e) => setTransactionData(e.target.value)}
                placeholder="PASTE YOUR TRANSACTION DATA HERE..."
                style={{
                  width: '100%',
                  height: '160px',
                  padding: '1.5rem',
                  border: '4px solid black',
                  backgroundColor: '#fafafa',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  boxShadow: 'inset 4px 4px 0 #ddd',
                  fontWeight: '500'
                }}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !transactionData.trim()}
                style={{
                  width: '100%',
                  padding: '1.5rem 2rem',
                  backgroundColor: '#ff0000',
                  color: 'white',
                  border: '4px solid black',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  fontFamily: '"Arial Black", sans-serif',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '6px 6px 0 black',
                  marginTop: '1.5rem',
                  textTransform: 'uppercase',
                  transition: 'all 0.1s'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(4px, 4px)';
                  e.currentTarget.style.boxShadow = '2px 2px 0 black';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '6px 6px 0 black';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '6px 6px 0 black';
                }}
              >
                {loading ? 'AI THINKING...' : 'RIP & TEAR ANALYZE'}
              </button>
            </form>

            {error && (
              <div style={{
                padding: '1.5rem',
                border: '4px solid #ff4444',
                backgroundColor: '#ffeeee',
                marginTop: '1rem',
                fontWeight: 'bold',
                color: 'black'
              }}>
                ERROR: {error}
              </div>
            )}

            {result && (
              <div style={{
                border: '4px solid black',
                backgroundColor: '#fff',
                boxShadow: '6px 6px 0 black',
                padding: '2rem',
                marginTop: '2rem',
                rotate: '-0.5deg'
              }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  alignItems: 'flex-start',
                  marginBottom: '1.5rem' 
                }}>
                  <div style={{
                    padding: '1rem 2rem',
                    minWidth: '140px',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    border: '3px solid black',
                    textTransform: 'uppercase',
                    boxShadow: '4px 4px 0 black',
                    ...getRiskStyle(result.risk_level)
                  }}>
                    {result.risk_level} RISK
                  </div>
                  <h3 style={{
                    fontSize: '2rem',
                    fontWeight: '900',
                    color: 'black',
                    margin: 0,
                    lineHeight: 1.2,
                    flex: 1,
                    fontFamily: '"Arial Black", sans-serif'
                  }}>
                    {result.summary}
                  </h3>
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  color: 'black',
                  lineHeight: '1.6',
                  margin: 0,
                  fontFamily: 'monospace',
                  fontWeight: '500'
                }}>
                  {typeof result.explanation === 'object' ? (
                    <>
                      <p style={{ marginBottom: '1rem' }}>
                        <strong style={{ backgroundColor: 'black', color: 'white', padding: '2px 6px' }}>SIMPLE:</strong><br/>
                        {result.explanation.simple}
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong style={{ backgroundColor: 'black', color: 'white', padding: '2px 6px' }}>TECHNICAL:</strong><br/>
                        {result.explanation.technical}
                      </p>
                    </>
                  ) : (
                    <p>{result.explanation}</p>
                  )}
                </div>
                <Link href="/history" style={{
                  display: 'inline-block',
                  marginTop: '1.5rem',
                  padding: '1rem 2rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                  fontFamily: '"Arial Black", sans-serif'
                }}>
                  VIEW IN HISTORY →
                </Link>
              </div>
            )}

          </div>

          {/* Chat Panel */}
          <div style={{
            border: '4px solid black',
            backgroundColor: '#fff',
            boxShadow: '-8px 8px 0 black',
            rotate: '-0.5deg',
            padding: '2rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: 'black',
              margin: '0 0 2rem 0',
              borderBottom: '3px solid black',
              paddingBottom: '0.5rem',
              fontFamily: '"Arial Black", sans-serif'
            }}>
              AI CHAT TERMINAL
            </h2>
            <div style={{
              height: '350px',
              border: '3px solid black',
              backgroundColor: '#000',
              color: '#00ff00',
              padding: '1.5rem',
              overflowY: 'auto',
              marginBottom: '1.5rem',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              boxShadow: 'inset 3px 3px 0 #333'
            }}>
              {chatMessages.length === 0 ? (
                <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                  READY FOR INPUT...
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    border: '2px solid #00ff00',
                    backgroundColor: msg.type === 'user' ? '#001100' : '#001a00',
                    maxWidth: '90%',
                    marginLeft: msg.type === 'user' ? 'auto' : 0,
                    borderRadius: 0
                  }}>
                    <strong style={{ color: msg.type === 'user' ? '#ffff00' : '#00ff00' }}>
                      {msg.type.toUpperCase()}
                    </strong> {msg.text}
                  </div>
                ))
              )}
              {chatLoading && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  border: '2px solid #00ff00',
                  backgroundColor: '#001a00',
                  maxWidth: '90%'
                }}>
                  <strong style={{ color: '#00ff00' }}>AI</strong> Typing...
                </div>
              )}
            </div>
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '1rem' }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="ASK AI (Enter to send)"
                style={{
                  flex: 1,
                  padding: '1rem 1.5rem',
                  border: '3px solid black',
                  backgroundColor: '#111',
                  color: '#fff',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '1rem',
                  outline: 'none',
                  boxShadow: 'inset 3px 3px 0 #333'
                }}
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: '#ffff00',
                  color: 'black',
                  border: '4px solid black',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  fontFamily: '"Arial Black", sans-serif',
                  cursor: chatLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '6px 6px 0 black',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.1s'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(4px, 4px)';
                  e.currentTarget.style.boxShadow = '2px 2px 0 black';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '6px 6px 0 black';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '6px 6px 0 black';
                }}
              >
                TRANSMIT
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

