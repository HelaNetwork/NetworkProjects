/**
 * API Client - communicates with the backend Express server
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Analyze a transaction (full analysis with AI)
 */
export async function analyzeTransaction(txData) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(err.message || 'Analysis failed');
  }
  return res.json();
}

/**
 * Quick decode (no AI, faster)
 */
export async function quickDecode(txData) {
  const res = await fetch(`${API_BASE}/analyze/decode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txData),
  });
  if (!res.ok) throw new Error('Decode failed');
  return res.json();
}

/**
 * Simulate transaction outcomes
 */
export async function simulateTransaction(txData) {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txData),
  });
  if (!res.ok) throw new Error('Simulation failed');
  return res.json();
}

/**
 * Chat with AI assistant
 */
export async function chatWithAssistant(message, history = [], transactionContext = null) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, transactionContext }),
  });
  if (!res.ok) throw new Error('Chat failed');
  return res.json();
}

/**
 * Health check
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
