/**
 * app.js — AAP Dashboard Application
 * Connects to FastAPI backend (WebSocket + REST) or runs in demo mode with simulation.
 */

'use strict';

// ── Config ────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000/api';
const WS_URL   = 'ws://localhost:8000/ws/feed';
const DEMO_MODE = true; // Set false when backend is running

// ── State ──────────────────────────────────────────────────────────────
const state = {
  decisions:     [],
  challenges:    [],
  currentPage:   'overview',
  walletAddress: null,
  helaConnected: false,
  wsConnected:   false,
  decisionFilter:'ALL',
  agentKilled:   false,
  anchorsCount:  0,
};

// NSE stock data for simulation
const NSE_STOCKS = {
  RELIANCE:  { price: 2850, sector: 'Energy/Retail',  pe: 28.5 },
  TCS:       { price: 3920, sector: 'IT',             pe: 32.1 },
  HDFC:      { price: 1680, sector: 'Banking',        pe: 18.3 },
  INFY:      { price: 1430, sector: 'IT',             pe: 27.8 },
  WIPRO:     { price: 495,  sector: 'IT',             pe: 24.6 },
  ICICIBANK: { price: 1105, sector: 'Banking',        pe: 19.2 },
  KOTAKBANK: { price: 1780, sector: 'Banking',        pe: 22.4 },
  BHARTIARTL:{ price: 1650, sector: 'Telecom',        pe: 31.7 },
};

// ── Init ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeLaStatus();
  if (DEMO_MODE) {
    initDemoMode();
  } else {
    initWebSocket();
    loadData();
  }
  initModals();
  initButtons();
  initChatEngine();
  initTickerLive();
});

// ── Navigation ─────────────────────────────────────────────────────────
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });
}

function navigateTo(page) {
  state.currentPage = page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`nav-${page}`)?.classList.add('active');
  document.getElementById(`page-${page}`)?.classList.add('active');
  const titles = {
    overview:'Overview', decisions:'Decision Feed', approval:'Approval Queue',
    challenges:'Challenges', verify:'Verify Record', governance:'DAO Rules',
    portfolio:'Portfolio', report:'Protocol Report'
  };
  document.getElementById('page-title').textContent = titles[page] || page;

  if (page === 'decisions')  renderDecisions();
  if (page === 'approval')   renderApproval();
  if (page === 'challenges') renderChallenges();
  if (page === 'portfolio')  renderPortfolio();
}

// ── HeLa Status ────────────────────────────────────────────────────────
function initHeLaStatus() {
  const dot  = document.getElementById('hela-status-dot');
  const text = document.getElementById('hela-status-text');
  dot.className  = 'status-dot pending';
  text.textContent = 'HeLa Testnet...';
  setTimeout(() => {
    // Simulate connection check
    state.helaConnected = true;
    dot.className  = 'status-dot online';
    text.textContent = 'HeLa Testnet ✓';
    document.getElementById('agent-address').textContent = 'did:hela:0xF1nA9...1337';
    toast('Connected to HeLa Testnet (Chain 666)', 'success');
  }, 1800);
}

// ── Demo Mode Data Engine ──────────────────────────────────────────────
function initDemoMode() {
  const wsText = document.getElementById('ws-status-text');
  const wsDot  = document.getElementById('ws-status-dot');
  wsDot.className = 'status-dot online';
  wsText.textContent = 'Demo Mode';
  state.wsConnected = true;

  // Generate initial decisions
  generateDemoDecisions(8);
  renderAll();

  // Auto-generate new decisions every 15s
  setInterval(() => {
    if (!state.agentKilled) {
      const symbols = Object.keys(NSE_STOCKS);
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const pdr = generatePDR(sym, Math.floor(Math.random() * 20) + 5);
      state.decisions.unshift(pdr);
      if (pdr.approval_type === 'MANUAL') {
        // Auto-escalate to approval queue notification
        toast(`⚠ Manual approval required: ${pdr.asset} ${pdr.action}`, 'warn');
      }
      updateStats();
      updateMiniFeeed();
      updateBadges();
      if (state.currentPage === 'decisions') renderDecisions();
      if (state.currentPage === 'approval')  renderApproval();
    }
  }, 15000);
}

function generateDemoDecisions(count) {
  const symbols = Object.keys(NSE_STOCKS);
  for (let i = 0; i < count; i++) {
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const pdr = generatePDR(sym, Math.floor(Math.random() * 50) + 5);
    // Stagger timestamps
    const ago = (count - i) * 8 * 60 * 1000;
    pdr.timestamp = new Date(Date.now() - ago).toISOString();
    state.decisions.push(pdr);
  }
  // Add 2 challenges
  if (state.decisions.length > 2) {
    state.challenges.push(generateChallenge(state.decisions[1]));
    state.challenges.push(generateChallenge(state.decisions[3], 'UPHELD'));
  }
  state.anchorsCount = Math.floor(state.decisions.length / 3);
}

function generatePDR(symbol, qty) {
  const stock     = NSE_STOCKS[symbol] || { price: 1000, sector: 'Unknown', pe: 20 };
  const price     = stock.price * (1 + (Math.random() - 0.5) * 0.04);
  const rsi       = 25 + Math.random() * 60;
  const confidence= 0.50 + Math.random() * 0.45;
  const riskScore = 0.15 + Math.random() * 0.65;
  const macdCross = Math.random() > 0.6 ? 'BULLISH_CROSSOVER' : (Math.random() > 0.5 ? 'BEARISH_CROSSOVER' : 'NONE');

  // Determine action from signals
  let action;
  if (rsi < 35 && macdCross === 'BULLISH_CROSSOVER') action = 'BUY';
  else if (rsi > 65 && macdCross === 'BEARISH_CROSSOVER') action = 'SELL';
  else if (confidence > 0.75 && riskScore < 0.4) action = Math.random() > 0.5 ? 'BUY' : 'SELL';
  else action = 'HOLD';

  const tradeValue = qty * price;
  let approvalType;
  if (riskScore > 0.80) approvalType = 'BLOCKED';
  else if (tradeValue > 10000 || riskScore > 0.5) approvalType = 'MANUAL';
  else approvalType = 'AUTO';

  const riskLabel = riskScore < 0.25 ? 'LOW' : riskScore < 0.5 ? 'MEDIUM' : riskScore < 0.75 ? 'HIGH' : 'EXTREME';

  const sessionId   = Math.random().toString(36).slice(2, 10);
  const sequenceNum = Math.floor(Math.random() * 9999);
  const decisionId  = `aap_${symbol}_${sessionId}_${String(sequenceNum).padStart(4,'0')}`;
  const pdrHash     = sha256Sim(decisionId + price + qty + Date.now());
  const ipfsCid     = 'Qm' + sha256Sim(decisionId).slice(0, 44);

  const sentimentScore = (Math.random() - 0.3) * 1.5;
  const explanations = {
    BUY:  `Buying ${qty} ${symbol} at ₹${price.toFixed(0)} — RSI(${rsi.toFixed(0)}) shows recovery from ${rsi < 35 ? 'oversold' : 'neutral'} levels. ${macdCross === 'BULLISH_CROSSOVER' ? 'MACD bullish crossover confirmed.' : ''} Confidence: ${(confidence*100).toFixed(0)}%.`,
    SELL: `Selling ${qty} ${symbol} at ₹${price.toFixed(0)} — RSI(${rsi.toFixed(0)}) approaching ${rsi > 65 ? 'overbought' : 'resistance'}. ${macdCross === 'BEARISH_CROSSOVER' ? 'MACD bearish crossover.' : ''} Taking profit at target.`,
    HOLD: `Holding position — mixed signals for ${symbol}. RSI(${rsi.toFixed(0)}) neutral. Waiting for clearer directional momentum before entering.`,
  };

  let execStatus;
  if (approvalType === 'BLOCKED') execStatus = 'BLOCKED';
  else if (approvalType === 'MANUAL') execStatus = 'PENDING_MANUAL_APPROVAL';
  else execStatus = Math.random() > 0.2 ? 'PENDING_CHALLENGE' : 'APPROVED';

  return {
    decision_id:      decisionId,
    timestamp:        new Date().toISOString(),
    session_id:       sessionId,
    sequence_number:  sequenceNum,
    action:           action,
    asset:            symbol,
    quantity:         qty,
    price_at_decision:Math.round(price * 100) / 100,
    trade_value_inr:  Math.round(tradeValue),
    currency:         'INR',
    input_features: {
      rsi_14:          Math.round(rsi * 10) / 10,
      rsi_zone:        rsi < 30 ? 'OVERSOLD' : rsi > 70 ? 'OVERBOUGHT' : rsi < 45 ? 'WEAK' : rsi > 55 ? 'STRONG' : 'NEUTRAL',
      macd:            (Math.random() - 0.4) * 5,
      macd_signal:     (Math.random() - 0.4) * 3,
      macd_crossover:  macdCross,
      bb_position:     ['LOWER_BAND','MIDDLE','UPPER_BAND'][Math.floor(Math.random()*3)],
      volume_ratio:    0.6 + Math.random() * 1.8,
      volume_spike:    Math.random() > 0.7,
      golden_cross:    Math.random() > 0.7,
      death_cross:     Math.random() > 0.8,
      trend_direction: ['BULLISH','BEARISH','NEUTRAL'][Math.floor(Math.random()*3)],
      overall_signal:  ['STRONG_BUY','BUY','HOLD','SELL','STRONG_SELL'][Math.floor(Math.random()*5)],
      signal_strength: Math.round(Math.random() * 1000) / 1000,
      atr_pct:         1.0 + Math.random() * 3,
      india_vix:       10 + Math.random() * 15,
      nifty_trend:     Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
    },
    external_signals: {
      news_sentiment_score: Math.round(sentimentScore * 100) / 100,
      news_sentiment_label: sentimentScore > 0.4 ? 'POSITIVE' : sentimentScore < -0.3 ? 'NEGATIVE' : 'NEUTRAL',
      data_sources: ['NSE_YF_API_v1','Gemini_News_v1'],
    },
    model_info: {
      model_id:  'aap-fin-agent-v1.0',
      llm:       'gemini-1.5-pro',
      model_hash:'a1b2c3d4e5f6',
      temperature:0.2,
    },
    reasoning_chain: [
      { step:1, thought:`RSI at ${rsi.toFixed(1)} — ${rsi<35?'oversold, recovery likely':rsi>65?'overbought, risk of reversal':'neutral zone, watching momentum'}` },
      { step:2, thought:`MACD: ${macdCross==='BULLISH_CROSSOVER'?'bullish crossover confirmed — momentum shifting up':macdCross==='BEARISH_CROSSOVER'?'bearish crossover — momentum weakening':'no clear crossover signal yet'}` },
      { step:3, thought:`News sentiment ${sentimentScore>0?'positive ('+sentimentScore.toFixed(2)+')':'negative ('+sentimentScore.toFixed(2)+')'} — ${stock.sector} sector news ${sentimentScore>0?'supportive':'cautionary'}` },
      { step:4, thought:`Risk assessment: ${riskLabel} (${(riskScore*100).toFixed(0)}%). Trade value ₹${Math.round(tradeValue).toLocaleString('en-IN')}. Approval: ${approvalType}` },
    ],
    human_explanation: explanations[action],
    confidence_score: Math.round(confidence * 1000) / 1000,
    risk_score:       riskLabel,
    risk_score_numeric: Math.round(riskScore * 1000) / 1000,
    approval_type:    approvalType,
    execution_status: execStatus,
    challenge_window_hours: 24,
    stop_loss_price:  action === 'BUY' ? Math.round(price * 0.975 * 100) / 100 : null,
    target_price:     action === 'BUY' ? Math.round(price * 1.04 * 100) / 100 : null,
    expected_outcome: action === 'BUY' ? '+3-4% in 5 days' : action === 'SELL' ? '-2-3% risk avoided' : 'Awaiting signal',
    pdr_hash:         pdrHash,
    ipfs_cid:         ipfsCid,
    ipfs_url:         `https://ipfs.io/ipfs/${ipfsCid}`,
    hela_anchor_tx:   Math.random() > 0.4 ? `0x${sha256Sim('tx'+decisionId).slice(0,40)}` : null,
    merkle_info:      { pending: Math.random() > 0.5, merkle_root: sha256Sim('root'+Date.now()), batch_size: 10 },
    verification:     { level1: { passed: true, name:'Hash Integrity' } },
    zk_proof:         {
      passed: riskScore <= 0.8 && confidence >= 0.4,
      simulated: true,
      circuit: 'ConstrainedDecision_v1',
      proves: [`confidence ≥ 0.40 ${confidence>=0.4?'✓':'✗'}`, `risk ≤ 0.80 ${riskScore<=0.8?'✓':'✗'}`],
    },
    pre_validation: {
      passed:    approvalType !== 'BLOCKED',
      override_type: approvalType,
      violations: approvalType === 'BLOCKED' ? [{rule:'RISK_SCORE_EXTREME',message:'Risk too high',severity:'EXTREME'}] : [],
    },
  };
}

function generateChallenge(pdr, status = 'OPEN') {
  const reasons = [
    'RSI was not actually oversold at time of decision — data source error suspected',
    'News sentiment score appears inflated — MoneyControl API returned stale data',
    'Trade exceeded 5% portfolio limit — risk scorer failed to account for open positions',
  ];
  return {
    challenge_id:   `ch_${pdr.decision_id}_0001`,
    decision_id:    pdr.decision_id,
    reason:         reasons[Math.floor(Math.random() * reasons.length)],
    status:         status,
    votes_for:      status === 'UPHELD' ? 7 : Math.floor(Math.random() * 8),
    votes_against:  status === 'DISMISSED' ? 9 : Math.floor(Math.random() * 6),
    raised_at:      new Date(Date.now() - 3600000).toISOString(),
    asset:          pdr.asset,
    action:         pdr.action,
    challenger_addr: '0x' + sha256Sim('challenger').slice(0,40),
  };
}

// ── Render ─────────────────────────────────────────────────────────────
function renderAll() {
  updateStats();
  updateMiniFeeed();
  updateSignalPanel();
  updateDAOFlowStep();
  updateBadges();
  renderDecisions();
  renderApproval();
  renderChallenges();
}

function updateDAOFlowStep() {
  const daoStep = document.getElementById('flow-dao');
  const daoSub  = document.getElementById('flow-dao-sub');
  if (!daoStep) return;
  const openChallenges = state.challenges.filter(c => c.status === 'OPEN').length;
  const totalVotes = state.challenges.reduce((s,c) => s + c.votes_for + c.votes_against, 0);
  if (openChallenges > 0 || state.challenges.length > 0) {
    daoStep.classList.add('active');
    if (daoSub) {
      if (openChallenges > 0) {
        daoSub.textContent = `${openChallenges} open · ${totalVotes} votes`;
        daoSub.style.color = 'var(--warn)';
      } else {
        daoSub.textContent = `All resolved · ${totalVotes} votes cast`;
        daoSub.style.color = 'var(--green)';
      }
    }
  } else {
    daoStep.classList.remove('active');
    if (daoSub) {
      daoSub.textContent = '24h challenge window';
      daoSub.style.color = '';
    }
  }
}

function updateStats() {
  const decisions  = state.decisions;
  const challenges = state.challenges;
  const pending    = decisions.filter(d => d.execution_status === 'PENDING_MANUAL_APPROVAL');
  const autoApproved= decisions.filter(d => d.approval_type === 'AUTO');
  const avgConf    = decisions.length ? (decisions.reduce((s,d) => s + (d.confidence_score||0),0) / decisions.length).toFixed(2) : '0.00';

  animateCounter('stat-total',      decisions.length);
  animateCounter('stat-auto',       autoApproved.length);
  animateCounter('stat-manual',     pending.length);
  animateCounter('stat-challenges', challenges.filter(c=>c.status==='OPEN').length);
  document.getElementById('stat-conf').textContent = avgConf;
  animateCounter('stat-anchored',   state.anchorsCount);
}

function animateCounter(id, target) {
  const el   = document.getElementById(id);
  if (!el) return;
  const curr = parseInt(el.textContent) || 0;
  if (curr === target) return;
  const step = target > curr ? 1 : -1;
  let val    = curr;
  const iv   = setInterval(() => {
    val += step;
    el.textContent = val;
    if (val === target) clearInterval(iv);
  }, Math.max(1, 20 / Math.abs(target - curr)));
}

function updateMiniFeeed() {
  const feed = document.getElementById('mini-feed');
  const recent = state.decisions.slice(0, 6);
  if (!recent.length) {
    feed.innerHTML = '<div class="feed-empty">No decisions yet. Click "Analyze Trade" to start.</div>';
    return;
  }
  feed.innerHTML = recent.map(d => `
    <div class="mini-item" onclick="openPDRModal('${d.decision_id}')">
      <span class="mini-badge badge-${d.action.toLowerCase()}">${d.action}</span>
      <div class="mini-info">
        <div class="mini-sym">${d.asset}</div>
        <div class="mini-sub">${d.quantity} shares · ₹${(d.trade_value_inr||0).toLocaleString('en-IN')}</div>
      </div>
      <div class="mini-status">
        <div class="mini-risk risk-${(d.risk_score||'').toLowerCase()}">${d.risk_score||'?'}</div>
        <div class="mini-sub">${timeAgo(d.timestamp)}</div>
      </div>
    </div>
  `).join('');
}

function updateSignalPanel() {
  const latest = state.decisions[0];
  if (!latest) return;
  const f = latest.input_features || {};
  const s = latest.external_signals || {};

  set('sig-rsi',      f.rsi_14?.toFixed(1) || '—');
  set('sig-rsi-zone', f.rsi_zone || '—');
  set('sig-macd',     f.macd?.toFixed(3) || '—');
  set('sig-macd-cross', f.macd_crossover || 'NONE');
  set('sig-bb',       '—');
  set('sig-bb-pos',   f.bb_position || '—');
  set('sig-vol',      f.volume_ratio ? `${f.volume_ratio.toFixed(2)}x` : '—');
  set('sig-vol-spike',f.volume_spike ? '⚡ SPIKE' : 'Normal');
  set('sig-vix',      f.india_vix?.toFixed(1) || '—');
  set('sig-vix-sent', f.india_vix < 15 ? 'LOW FEAR' : f.india_vix < 20 ? 'MODERATE' : 'HIGH FEAR');
  set('sig-sent',     s.news_sentiment_score?.toFixed(3) || '—');
  set('sig-sent-label', s.news_sentiment_label  || '—');
  const ob = document.getElementById('sig-overall');
  if (ob) {
    ob.textContent = f.overall_signal || '—';
    const colors = {STRONG_BUY:'#00e676',BUY:'#00e676',HOLD:'#8892a4',SELL:'#ff4757',STRONG_SELL:'#ff4757'};
    ob.style.color      = colors[f.overall_signal] || 'var(--cyan)';
    ob.style.background = `${colors[f.overall_signal]}22` || 'rgba(0,212,255,0.1)';
  }
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function updateBadges() {
  const total   = state.decisions.length;
  const manual  = state.decisions.filter(d => d.execution_status === 'PENDING_MANUAL_APPROVAL').length;
  const open    = state.challenges.filter(c => c.status === 'OPEN').length;
  document.getElementById('badge-decisions').textContent  = total;
  document.getElementById('badge-approval').textContent   = manual;
  document.getElementById('badge-challenges').textContent = open;
}

// ── Decision Feed Render ───────────────────────────────────────────────
function renderDecisions() {
  const list   = document.getElementById('decision-list');
  const filter = state.decisionFilter;
  const search = document.getElementById('decision-search')?.value.toLowerCase() || '';

  let items = state.decisions;
  if (filter !== 'ALL') items = items.filter(d => d.execution_status === filter || d.approval_type === filter);
  if (search) items = items.filter(d =>
    d.decision_id?.toLowerCase().includes(search) ||
    d.asset?.toLowerCase().includes(search)
  );

  if (!items.length) {
    list.innerHTML = '<div class="feed-empty">No decisions match the current filter.</div>';
    return;
  }

  list.innerHTML = items.map(d => {
    const statusClass = statusToClass(d.execution_status);
    const statusLabel = statusToLabel(d.execution_status);
    const isAnomaly   = d.confidence_score < 0.60;
    return `
      <div class="decision-card" onclick="openPDRModal('${d.decision_id}')">
        <div class="dc-action-badge ${d.action.toLowerCase()}">${d.action}</div>
        <div class="dc-main">
          <div class="dc-symbol">${d.asset} <span style="font-size:12px;font-weight:400;color:var(--text-sub)">· ₹${(d.price_at_decision||0).toFixed(2)} · ${d.quantity} shares</span></div>
          <div class="dc-id">${d.decision_id}</div>
          <div class="dc-explanation">${d.human_explanation || '—'}</div>
        </div>
        <div class="dc-meta">
          <span class="dc-status ${statusClass}">${statusLabel}</span>
          <span class="dc-confidence">Conf: ${((d.confidence_score||0)*100).toFixed(0)}% · Risk: ${d.risk_score||'?'}</span>
          ${isAnomaly ? '<span class="dc-anomaly">⚠ Low Confidence</span>' : ''}
          <span style="font-size:11px;color:var(--text-dim)">${timeAgo(d.timestamp)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function statusToClass(status) {
  const map = {
    'PENDING_CHALLENGE':       'status-pending',
    'PENDING_MANUAL_APPROVAL': 'status-manual',
    'APPROVED':                'status-approved',
    'CHALLENGED':              'status-challenged',
    'BLOCKED':                 'status-blocked',
    'REJECTED':                'status-rejected',
  };
  return map[status] || 'status-pending';
}

function statusToLabel(status) {
  const map = {
    'PENDING_CHALLENGE':       'Pending Challenge Window',
    'PENDING_MANUAL_APPROVAL': '⚠ Manual Approval',
    'APPROVED':                '✓ Approved',
    'CHALLENGED':              '⊕ Challenged',
    'BLOCKED':                 '⛔ Blocked',
    'REJECTED':                '✕ Rejected',
  };
  return map[status] || status;
}

// ── Approval Queue ──────────────────────────────────────────────────────
function renderApproval() {
  const pending = state.decisions.filter(d => d.execution_status === 'PENDING_MANUAL_APPROVAL');
  const list    = document.getElementById('approval-list');
  if (!pending.length) {
    list.innerHTML = '<div class="feed-empty">No pending approvals.</div>';
    return;
  }
  list.innerHTML = pending.map(d => `
    <div class="approval-card">
      <div class="approval-info">
        <div class="approval-title">${d.action} ${d.quantity} ${d.asset} — ₹${(d.trade_value_inr||0).toLocaleString('en-IN')}</div>
        <div class="approval-sub">${d.decision_id} · Risk: ${d.risk_score} (${((d.risk_score_numeric||0)*100).toFixed(0)}%) · Conf: ${((d.confidence_score||0)*100).toFixed(0)}%</div>
        <div class="approval-sub" style="margin-top:4px;">${d.human_explanation}</div>
      </div>
      <div class="approval-actions">
        <button class="btn-approve" onclick="approveDecision('${d.decision_id}')">✓ Approve</button>
        <button class="btn-reject"  onclick="rejectDecision('${d.decision_id}')">✕ Reject</button>
        <button class="btn-cancel" style="font-size:12px" onclick="openPDRModal('${d.decision_id}')">View PDR</button>
      </div>
    </div>
  `).join('');
}

function approveDecision(id) {
  const d = state.decisions.find(x => x.decision_id === id);
  if (!d) return;
  d.execution_status = 'APPROVED';
  d.approval_type    = 'MANUAL_APPROVED';
  renderApproval();
  updateBadges();
  updateStats();
  if (state.currentPage === 'decisions') renderDecisions();
  toast(`✓ Approved: ${d.asset} ${d.action}`, 'success');
}

function rejectDecision(id) {
  const d = state.decisions.find(x => x.decision_id === id);
  if (!d) return;
  d.execution_status = 'REJECTED';
  renderApproval();
  updateBadges();
  updateStats();
  if (state.currentPage === 'decisions') renderDecisions();
  toast(`✕ Rejected: ${d.asset} ${d.action}`, 'warn');
}

// ── Challenges Render ───────────────────────────────────────────────────
function renderChallenges() {
  const list   = document.getElementById('challenge-list');
  const active = document.querySelector('[data-filter-ch].active');
  const filter = active?.dataset.filterCh || 'ALL';
  let items    = state.challenges;
  if (filter !== 'ALL') items = items.filter(c => c.status === filter);

  if (!items.length) {
    list.innerHTML = '<div class="feed-empty">No challenges to display.</div>';
    return;
  }

  list.innerHTML = items.map(c => {
    const total = c.votes_for + c.votes_against;
    const forPct = total > 0 ? (c.votes_for / total * 100).toFixed(0) : 50;
    const statusClass = c.status === 'OPEN' ? 'ch-open' : c.status === 'UPHELD' ? 'ch-upheld' : 'ch-dismissed';
    return `
      <div class="challenge-card">
        <div class="ch-header">
          <span class="ch-id">⊕ ${c.challenge_id}</span>
          <span>
            <span style="font-size:12px;color:var(--text-sub)">${c.asset} ${c.action}</span>
          </span>
          <span class="ch-status ${statusClass}">${c.status}</span>
        </div>
        <div class="ch-reason">${c.reason}</div>
        <div class="ch-vote-bar">
          <span class="vote-label">Uphold ${forPct}%</span>
          <div class="vote-track"><div class="vote-fill-for" style="width:${forPct}%"></div></div>
          <div class="vote-track" style="transform:scaleX(-1)"><div class="vote-fill-against" style="width:${100-forPct}%"></div></div>
          <span class="vote-label">Dismiss ${100-forPct}%</span>
        </div>
        <div class="ch-actions">
          ${c.status === 'OPEN' ? `
            <button class="btn-vote-for"     onclick="voteChallenge('${c.challenge_id}', true)">▲ Uphold Challenge (${c.votes_for})</button>
            <button class="btn-vote-against" onclick="voteChallenge('${c.challenge_id}', false)">▼ Dismiss (${c.votes_against})</button>
          ` : `<span style="font-size:12px;color:var(--text-sub)">Final: ${c.votes_for} uphold / ${c.votes_against} dismiss</span>`}
          <button class="btn-cancel" style="font-size:12px;margin-left:auto" onclick="openPDRModal('${c.decision_id}')">View PDR</button>
        </div>
      </div>
    `;
  }).join('');
}

function voteChallenge(id, support) {
  const ch = state.challenges.find(c => c.challenge_id === id);
  if (!ch || ch.status !== 'OPEN') return;
  if (support) ch.votes_for++; else ch.votes_against++;
  renderChallenges();
  updateDAOFlowStep();
  updateStats();
  toast(`Vote recorded: ${support ? 'Uphold' : 'Dismiss'} challenge`, 'success');
}

// ── PDR Detail Modal ────────────────────────────────────────────────────
function openPDRModal(decisionId) {
  const pdr  = state.decisions.find(d => d.decision_id === decisionId);
  if (!pdr) return;

  document.getElementById('pdr-modal-title').textContent = `PDR — ${pdr.decision_id}`;

  const f  = pdr.input_features || {};
  const s  = pdr.external_signals || {};
  const mi = pdr.model_info || {};
  const zk = pdr.zk_proof || {};

  const actionColor = pdr.action==='BUY' ? 'var(--green)' : pdr.action==='SELL' ? 'var(--danger)' : 'var(--text-sub)';

  document.getElementById('pdr-modal-body').innerHTML = `
    <div class="pdr-grid">
      <div>
        <div class="pdr-field">
          <div class="pdr-field-label">Action</div>
          <div class="pdr-field-value" style="color:${actionColor};font-size:18px;font-weight:800">${pdr.action} ${pdr.quantity} ${pdr.asset}</div>
        </div>
        <div class="pdr-field">
          <div class="pdr-field-label">Price · Trade Value</div>
          <div class="pdr-field-value">₹${(pdr.price_at_decision||0).toFixed(2)} · ₹${(pdr.trade_value_inr||0).toLocaleString('en-IN')}</div>
        </div>
        <div class="pdr-field">
          <div class="pdr-field-label">Confidence · Risk</div>
          <div class="pdr-field-value">${((pdr.confidence_score||0)*100).toFixed(1)}% · ${pdr.risk_score} (${((pdr.risk_score_numeric||0)*100).toFixed(0)}%)</div>
        </div>
        <div class="pdr-field">
          <div class="pdr-field-label">Approval · Status</div>
          <div class="pdr-field-value">${pdr.approval_type} → ${pdr.execution_status}</div>
        </div>
        <div class="pdr-field">
          <div class="pdr-field-label">Model</div>
          <div class="pdr-field-value">${mi.llm || '?'} · hash: ${mi.model_hash || '?'}</div>
        </div>
        <div class="pdr-field">
          <div class="pdr-field-label">Key Technicals</div>
          <div class="pdr-field-value">RSI: ${f.rsi_14?.toFixed(1) || '?'} [${f.rsi_zone||'?'}] · MACD: ${f.macd_crossover||'?'}</div>
        </div>
        <div class="pdr-field">
          <div class="pdr-field-label">News Sentiment</div>
          <div class="pdr-field-value">${s.news_sentiment_score?.toFixed(3) || '?'} [${s.news_sentiment_label||'?'}]</div>
        </div>
        <div class="pdr-field">
          <div class="pdr-field-label">Expected Outcome · Stop-Loss</div>
          <div class="pdr-field-value">${pdr.expected_outcome || '?'} · ₹${pdr.stop_loss_price?.toFixed(2) || '—'}</div>
        </div>
      </div>
      <div>
        <div class="pdr-field">
          <div class="pdr-field-label">💬 Human Explanation</div>
          <div class="pdr-field-value" style="font-family:Inter;white-space:normal;line-height:1.6">${pdr.human_explanation || '—'}</div>
        </div>
        <div class="pdr-field" style="margin-top:12px">
          <div class="pdr-field-label">Chain of Thought</div>
          ${(pdr.reasoning_chain || []).map(r => `
            <div class="cot-step">
              <div class="cot-num">${r.step}</div>
              <div class="cot-thought">${r.thought}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="proof-section">
      <div class="proof-title">🔐 Cryptographic Anchors</div>
      <div class="proof-item"><span>PDR Hash (sha256)</span><span style="font-family:monospace;font-size:10px;color:var(--cyan)">${(pdr.pdr_hash||'').slice(0,32)}...</span></div>
      <div class="proof-item"><span>IPFS CID</span><span style="font-family:monospace;font-size:10px;color:var(--purple)">${pdr.ipfs_cid || '—'}</span></div>
      <div class="proof-item"><span>HeLa Anchor TX</span><span style="font-family:monospace;font-size:10px;color:var(--green)">${pdr.hela_anchor_tx ? pdr.hela_anchor_tx.slice(0,20)+'...' : 'Pending batch'}</span></div>
      <div class="proof-item"><span>L1 Hash Check</span><span class="${pdr.verification?.level1?.passed ? 'proof-pass' : 'proof-fail'}">${pdr.verification?.level1?.passed ? '✓ PASS' : '✗ FAIL'}</span></div>
      <div class="proof-item"><span>ZK Proof (Groth16)</span><span class="${zk.passed ? 'proof-pass' : 'proof-fail'}">${zk.passed ? '✓ PASS' : '✗ FAIL'} ${zk.simulated ? '(simulated)' : ''}</span></div>
      ${(zk.proves||[]).map(p => `<div class="proof-item" style="padding-left:16px"><span style="color:var(--text-dim)">${p}</span></div>`).join('')}
    </div>

    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn-primary" style="flex:1" onclick="runVerify('${pdr.decision_id}')">🔍 Full Verification (L1+L2+L3)</button>
      <button class="btn-danger-submit btn-primary" style="background:rgba(255,71,87,0.15);color:var(--danger)" onclick="openChallengeFor('${pdr.decision_id}')">⊕ Raise Challenge</button>
    </div>
  `;

  openModal('modal-pdr');
}

function openChallengeFor(id) {
  closeModal('modal-pdr');
  document.getElementById('ch-decision-id').value = id;
  openModal('modal-challenge');
}

// ── Verification ────────────────────────────────────────────────────────
function runVerify(idArg) {
  const id  = idArg || document.getElementById('verify-input').value.trim();
  if (!id) return toast('Enter a decision ID', 'warn');

  const pdr = state.decisions.find(d => d.decision_id === id);
  const resultDiv = document.getElementById('verify-result');
  resultDiv.style.display = 'block';

  if (!pdr) {
    resultDiv.innerHTML = `<div class="v-level-row"><span class="v-tick" style="color:var(--danger)">✗</span><div class="v-info"><div class="v-name">Not Found</div><div class="v-msg">Decision ID "${id}" not found in local store</div></div></div>`;
    return;
  }

  const l1pass = pdr.verification?.level1?.passed !== false;
  const l2pass = true; // Simulation
  const l3pass = pdr.zk_proof?.passed !== false;

  setTimeout(() => {
    resultDiv.innerHTML = `
      <div class="v-level-row">
        <div class="v-level-badge ${l1pass?'v-pass':'v-fail'}">L1</div>
        <div class="v-info">
          <div class="v-name">Hash Integrity Check</div>
          <div class="v-msg">${l1pass ? 'PDR hash matches anchored record — untampered ✓' : 'Hash mismatch — possible tampering!'}</div>
        </div>
        <span class="v-tick">${l1pass ? '✓' : '✗'}</span>
      </div>
      <div class="v-level-row">
        <div class="v-level-badge ${l2pass?'v-pass':'v-fail'}">L2</div>
        <div class="v-info">
          <div class="v-name">Deterministic Replay</div>
          <div class="v-msg">Replayed decision matches original ± tolerance (simulated — same model inputs → same output) ✓</div>
        </div>
        <span class="v-tick">${l2pass ? '✓' : '✗'}</span>
      </div>
      <div class="v-level-row">
        <div class="v-level-badge ${l3pass?'v-pass':'v-fail'}">L3</div>
        <div class="v-info">
          <div class="v-name">ZK-SNARK Proof (Groth16)</div>
          <div class="v-msg">Circuit: ConstrainedDecision_v1 · ${(pdr.zk_proof?.proves||[]).join(' · ')} ${pdr.zk_proof?.simulated ? '(simulated)' : ''}</div>
        </div>
        <span class="v-tick">${l3pass ? '✓' : '✗'}</span>
      </div>
      <div class="v-level-row" style="border-color:${l1pass&&l2pass&&l3pass?'rgba(0,230,118,0.3)':'rgba(255,71,87,0.3)'}">
        <div class="v-level-badge ${l1pass&&l2pass&&l3pass?'v-pass':'v-fail'}">⬡</div>
        <div class="v-info">
          <div class="v-name">Overall Verdict</div>
          <div class="v-msg" style="color:${l1pass&&l2pass&&l3pass?'var(--green)':'var(--danger)'}">
            ${l1pass&&l2pass&&l3pass ? '✓ VERIFIED — Decision is authentic, untampered, and rule-compliant on HeLa Chain' : '✗ VERIFICATION FAILED'}
          </div>
        </div>
      </div>
    `;
    if (idArg) {
      closeModal('modal-pdr');
      navigateTo('verify');
      document.getElementById('verify-input').value = id;
    }
    toast(`Verification complete: ${l1pass&&l2pass&&l3pass?'VERIFIED ✓':'FAILED ✗'}`, l1pass?'success':'error');
  }, 800);
}

// ── Modals & Buttons ────────────────────────────────────────────────────
function initModals() {
  document.querySelectorAll('.modal-close, [data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
  });
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.decisionFilter = btn.dataset.filter;
      renderDecisions();
    });
  });
  document.querySelectorAll('[data-filter-ch]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-ch]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderChallenges();
    });
  });
  document.getElementById('decision-search')?.addEventListener('input', renderDecisions);
  document.getElementById('verify-input' )?.addEventListener('keydown', e => { if (e.key === 'Enter') runVerify(); });
}

function initButtons() {
  document.getElementById('btn-analyze').addEventListener('click', () => openModal('modal-analyze'));
  document.getElementById('btn-kill'   ).addEventListener('click', () => openModal('modal-kill'));
  document.getElementById('btn-wallet' ).addEventListener('click', connectWallet);
  document.getElementById('btn-challenge-new').addEventListener('click', () => openModal('modal-challenge'));
  document.getElementById('btn-verify' ).addEventListener('click', () => runVerify());

  document.getElementById('btn-analyze-submit').addEventListener('click', () => {
    const sym = document.getElementById('analyze-symbol').value;
    const qty = parseInt(document.getElementById('analyze-qty').value) || 10;
    closeModal('modal-analyze');
    toast(`Analyzing ${sym}... this takes a moment`, 'warn');
    setTimeout(() => {
      const pdr = generatePDR(sym, qty);
      state.decisions.unshift(pdr);
      if (pdr.approval_type !== 'BLOCKED') state.anchorsCount++;
      renderAll();
      toast(`✓ Decision complete: ${sym} → ${pdr.action} (${pdr.risk_score} risk)`, pdr.approval_type === 'BLOCKED' ? 'error' : 'success');
    }, DEMO_MODE ? 1500 : 8000);
  });

  document.getElementById('btn-challenge-submit').addEventListener('click', () => {
    const id     = document.getElementById('ch-decision-id').value.trim();
    const reason = document.getElementById('ch-reason').value.trim();
    if (!id || !reason) { toast('Fill in decision ID and reason', 'warn'); return; }
    const ch = { challenge_id: `ch_${id}_${Date.now()}`, decision_id: id, reason, status: 'OPEN', votes_for: 0, votes_against: 0, raised_at: new Date().toISOString(), };
    state.challenges.unshift(ch);
    const pdr = state.decisions.find(d => d.decision_id === id);
    if (pdr) pdr.execution_status = 'CHALLENGED';
    closeModal('modal-challenge');
    updateBadges();
    updateDAOFlowStep();
    renderChallenges();
    if (state.currentPage === 'overview') updateStats();
    toast('⊕ Challenge raised on HeLa Chain (0.005 HELA staked)', 'success');
  });

  document.getElementById('btn-kill-confirm').addEventListener('click', () => {
    const reason = document.getElementById('kill-reason').value.trim();
    if (!reason) { toast('Provide a reason for kill switch', 'warn'); return; }
    state.agentKilled = true;
    closeModal('modal-kill');
    const killBtn = document.getElementById('btn-kill');
    killBtn.textContent = '▶ Resume Agents';
    killBtn.style.background = 'rgba(0,230,118,0.1)';
    killBtn.style.color      = 'var(--green)';
    killBtn.style.border     = '1px solid rgba(0,230,118,0.3)';
    killBtn.onclick = () => {
      state.agentKilled = false;
      killBtn.textContent = '⏹ Kill Switch';
      killBtn.style.background = '';
      killBtn.style.color      = '';
      killBtn.style.border     = '';
      killBtn.onclick = null;
      toast('✓ Agent operations resumed', 'success');
    };
    toast('⏹ All agent operations PAUSED — recorded on HeLa', 'error');
  });
}

function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id){ document.getElementById(id)?.classList.remove('open'); }

// ── Wallet Connection ───────────────────────────────────────────────────
async function connectWallet() {
  const btn = document.getElementById('btn-wallet');
  if (!window.ethereum) {
    toast('MetaMask not found. Install MetaMask to connect.', 'warn');
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const addr     = accounts[0];
    state.walletAddress = addr;

    // Add HeLa Testnet
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x29A',  // 666 in hex
        chainName: 'HeLa Testnet',
        nativeCurrency: { name: 'HELA', symbol: 'HELA', decimals: 18 },
        rpcUrls:         ['https://testnet-rpc.helachain.com'],
        blockExplorerUrls:['https://testnet-helascan.io'],
      }],
    });

    btn.textContent = `${addr.slice(0,6)}...${addr.slice(-4)}`;
    btn.style.background = 'rgba(0,230,118,0.1)';
    btn.style.color      = 'var(--green)';
    btn.style.border     = '1px solid rgba(0,230,118,0.3)';
    document.getElementById('agent-address').textContent = `did:hela:${addr.slice(0,10)}...`;
    toast(`✓ Wallet connected · HeLa Testnet`, 'success');
  } catch (e) {
    toast(`Wallet error: ${e.message}`, 'error');
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────
function sha256Sim(str) {
  // Deterministic pseudo-hash for demo (not cryptographic)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const h = Math.abs(hash).toString(16).padStart(8,'0');
  return (h + h + h + h + h + h + h + h).slice(0, 64);
}

function timeAgo(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  if (hrs  > 24) return `${Math.floor(hrs/24)}d ago`;
  if (hrs  > 0 ) return `${hrs}h ago`;
  if (mins > 0 ) return `${mins}m ago`;
  return 'just now';
}

function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const el        = document.createElement('div');
  el.className    = `toast ${type}`;
  const icon      = type === 'success' ? '✓' : type === 'error' ? '✗' : '⚠';
  const color     = type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--danger)' : 'var(--warn)';
  el.innerHTML    = `<span style="color:${color}">${icon}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ── Portfolio Data Engine ──────────────────────────────────────────────
const PORTFOLIO_HOLDINGS = {
  RELIANCE:   { qty: 15, avgCost: 2720, sector: 'Energy/Retail',  color: '#00d4ff' },
  TCS:        { qty: 8,  avgCost: 3750, sector: 'IT',             color: '#a78bfa' },
  HDFC:       { qty: 20, avgCost: 1600, sector: 'Banking',        color: '#00e676' },
  INFY:       { qty: 12, avgCost: 1380, sector: 'IT',             color: '#f472b6' },
  WIPRO:      { qty: 30, avgCost: 480,  sector: 'IT',             color: '#ffb300' },
  ICICIBANK:  { qty: 18, avgCost: 1050, sector: 'Banking',        color: '#3b82f6' },
  BHARTIARTL: { qty: 10, avgCost: 1590, sector: 'Telecom',        color: '#fb923c' },
};
const SECTOR_COLORS = {
  'Energy/Retail': '#00d4ff', 'IT': '#a78bfa', 'Banking': '#00e676', 'Telecom': '#fb923c',
};

function renderPortfolio() {
  let totalValue = 0, totalInvested = 0, positions = [];

  for (const [sym, h] of Object.entries(PORTFOLIO_HOLDINGS)) {
    const base = NSE_STOCKS[sym]?.price || h.avgCost;
    const ltp  = base * (1 + Math.sin(Date.now() / 100000 + sym.length) * 0.02);
    const value = ltp * h.qty, cost = h.avgCost * h.qty;
    const pnl = value - cost, pnlPct = pnl / cost * 100;
    const agentDec = state.decisions.find(d => d.asset === sym);
    totalValue += value; totalInvested += cost;
    positions.push({ sym, ...h, ltp, value, cost, pnl, pnlPct, agentAction: agentDec?.action || 'HOLD', agentDec });
  }

  const totalPnL = totalValue - totalInvested;
  const totalPnLPct = totalPnL / totalInvested * 100;

  // Hero
  document.getElementById('port-total-value').textContent = '₹' + Math.round(totalValue).toLocaleString('en-IN');
  document.getElementById('port-invested').textContent    = '₹' + Math.round(totalInvested).toLocaleString('en-IN');
  const unEl = document.getElementById('port-unrealised');
  unEl.textContent = (totalPnL >= 0 ? '+₹' : '-₹') + Math.abs(Math.round(totalPnL)).toLocaleString('en-IN');
  unEl.className   = 'port-hs-val ' + (totalPnL >= 0 ? 'green' : 'danger');
  document.getElementById('port-positions').textContent = positions.length;
  const agentToday = state.decisions.filter(d => {
    return Math.abs(Date.now() - new Date(d.timestamp).getTime()) < 86400000 && PORTFOLIO_HOLDINGS[d.asset];
  }).length;
  document.getElementById('port-agent-trades').textContent = agentToday;

  const pnlAmt = document.getElementById('port-pnl-amt');
  const pnlPct = document.getElementById('port-pnl-pct');
  pnlAmt.textContent = (totalPnL >= 0 ? '+₹' : '-₹') + Math.abs(Math.round(totalPnL)).toLocaleString('en-IN');
  pnlAmt.style.color = totalPnL >= 0 ? 'var(--green)' : 'var(--danger)';
  pnlPct.textContent = (totalPnLPct >= 0 ? '+' : '') + totalPnLPct.toFixed(2) + '%';
  pnlPct.style.color = totalPnLPct >= 0 ? 'var(--green)' : 'var(--danger)';
  const badge = document.getElementById('badge-portfolio');
  if (badge) { badge.textContent = (totalPnLPct >= 0 ? '+' : '') + totalPnLPct.toFixed(1) + '%'; }

  // Holdings table
  document.getElementById('holdings-body').innerHTML = positions.map(p => `
    <div class="ht-row" onclick="navigateTo('decisions')">
      <div><div class="ht-sym">${p.sym}</div><div class="ht-sector">${p.sector}</div></div>
      <div class="ht-mono">${p.qty}</div>
      <div class="ht-mono">₹${p.avgCost.toFixed(0)}</div>
      <div class="ht-mono">₹${p.ltp.toFixed(2)}</div>
      <div class="ht-mono">₹${Math.round(p.value).toLocaleString('en-IN')}</div>
      <div class="${p.pnl >= 0 ? 'ht-pnl-pos' : 'ht-pnl-neg'}">
        ${p.pnl >= 0 ? '+' : ''}₹${Math.round(Math.abs(p.pnl)).toLocaleString('en-IN')}
        <div style="font-size:10px;font-weight:400">${p.pnlPct >= 0 ? '+' : ''}${p.pnlPct.toFixed(2)}%</div>
      </div>
      <div><span class="ht-agent-badge ${p.agentAction.toLowerCase()}">${p.agentAction}</span></div>
    </div>
  `).join('');

  renderAllocationRing(positions, totalValue);
  renderActivityTimeline(positions);
  renderRiskBars(positions, totalValue);
}

function renderAllocationRing(positions, totalValue) {
  const svg = document.getElementById('alloc-ring');
  const legend = document.getElementById('alloc-legend');
  if (!svg || !legend) return;

  const sectors = {};
  for (const p of positions) {
    if (!sectors[p.sector]) sectors[p.sector] = { value: 0, color: SECTOR_COLORS[p.sector] || '#888' };
    sectors[p.sector].value += p.value;
  }
  const arr = Object.entries(sectors).sort((a,b) => b[1].value - a[1].value);
  const cx = 80, cy = 80, r = 60, sw = 22, circ = 2 * Math.PI * r;
  let offset = 0;
  let html = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(100,130,200,0.08)" stroke-width="${sw}"/>`;
  arr.forEach(([name, s]) => {
    const pct = s.value / totalValue;
    const dash = pct * circ, gap = circ - dash;
    html += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${sw}"
      stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
      stroke-dashoffset="${(-offset * circ).toFixed(2)}"
      stroke-linecap="round" data-sector="${name}" style="transition:all 0.8s ease"/>`;
    offset += pct;
  });
  svg.innerHTML = html;

  legend.innerHTML = arr.map(([name, s]) => {
    const pct = (s.value / totalValue * 100).toFixed(1);
    return `<div class="alloc-legend-item" onmouseenter="highlightSector('${name}')" onmouseleave="resetAllocRing()">
      <div class="alloc-dot" style="background:${s.color}"></div>
      <span class="alloc-lname">${name}</span>
      <span class="alloc-lpct">${pct}%</span>
      <span class="alloc-lval">₹${Math.round(s.value/1000)}K</span>
    </div>`;
  }).join('');

  const top = arr[0];
  const ctVal = document.getElementById('alloc-ct-val');
  if (ctVal) { ctVal.textContent = (top[1].value / totalValue * 100).toFixed(1) + '%'; ctVal.style.color = top[1].color; }
}

function highlightSector(name) {
  document.querySelectorAll('#alloc-ring circle[data-sector]').forEach(c => {
    c.style.opacity = c.dataset.sector === name ? '1' : '0.15';
  });
}
function resetAllocRing() {
  document.querySelectorAll('#alloc-ring circle[data-sector]').forEach(c => c.style.opacity = '1');
}

function renderActivityTimeline(positions) {
  const tl = document.getElementById('activity-timeline');
  if (!tl) return;
  const relevant = state.decisions.filter(d => PORTFOLIO_HOLDINGS[d.asset]).slice(0, 10);
  if (!relevant.length) {
    tl.innerHTML = '<div class="feed-empty">No agent decisions on your holdings yet. Run "Analyze Trade" to start.</div>';
    return;
  }
  tl.innerHTML = relevant.map((d, i) => {
    const ltp = NSE_STOCKS[d.asset]?.price || 0;
    const impact = d.action === 'BUY' ? `+₹${Math.round(d.quantity * ltp * 0.02).toLocaleString('en-IN')} est. upside` :
                   d.action === 'SELL' ? `-₹${Math.round(d.quantity * ltp * 0.01).toLocaleString('en-IN')} risk avoided` :
                   'Monitoring position';
    const iClass = d.action === 'BUY' ? 'pos' : d.action === 'SELL' ? 'neg' : 'neu';
    return `<div class="at-item">
      <div class="at-dot-col">
        <div class="at-dot ${d.action.toLowerCase()}"></div>
        ${i < relevant.length - 1 ? '<div class="at-line"></div>' : ''}
      </div>
      <div class="at-content">
        <div class="at-title">${d.action} ${d.quantity} ${d.asset} @ ₹${(d.price_at_decision||0).toFixed(2)}</div>
        <div class="at-sub">${d.human_explanation || '—'}</div>
        <span class="at-impact ${iClass}">${impact}</span>
      </div>
      <div class="at-time">${timeAgo(d.timestamp)}</div>
    </div>`;
  }).join('');
}

function renderRiskBars(positions, totalValue) {
  const container = document.getElementById('risk-bars');
  if (!container) return;
  const sorted = [...positions].sort((a,b) => b.value - a.value);
  container.innerHTML = sorted.map(p => {
    const conc = p.value / totalValue * 100;
    const risk = Math.min(95, conc * 1.8 + Math.abs(p.pnlPct) * 0.5);
    const cls  = risk < 20 ? 'low' : risk < 40 ? 'medium' : risk < 65 ? 'high' : 'extreme';
    const lbl  = cls === 'low' ? 'LOW' : cls === 'medium' ? 'MED' : cls === 'high' ? 'HIGH' : 'XTRM';
    const col  = cls === 'low' ? 'var(--green)' : cls === 'medium' ? 'var(--warn)' : 'var(--danger)';
    return `<div class="rb-item">
      <div class="rb-sym">${p.sym}</div>
      <div class="rb-bar-wrap"><div class="rb-bar ${cls}" style="width:${risk.toFixed(1)}%"></div></div>
      <div class="rb-val">${conc.toFixed(1)}%</div>
      <div class="rb-label" style="background:${col}22;color:${col}">${lbl}</div>
    </div>`;
  }).join('');
}

// ── Chat Engine ────────────────────────────────────────────────────────
const chatState = {
  sessionId:  null,
  agentId:    'gemini',
  reputation: 25,
  messages:   [],
};

const AGENT_THRESHOLDS = {
  llama3: { min_rep: 0,  max_risk: 1.0 },
  gemini: { min_rep: 10, max_risk: 0.7 },
  gpt4o:  { min_rep: 40, max_risk: 0.5 },
  claude: { min_rep: 70, max_risk: 0.3 },
};

function initChatEngine() {
  // Agent chip selection
  document.querySelectorAll('.agent-chip:not(.locked)').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.agent-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chatState.agentId = btn.dataset.agent;
      const names = { gemini:'Gemini 1.5 Pro', llama3:'Llama 3 70B', gpt4o:'GPT-4o', claude:'Claude 3.5' };
      showChatMsg('assistant', `Switched to **${names[chatState.agentId] || chatState.agentId}**. How can I help?`);
    });
  });

  // Send button
  document.getElementById('chat-send-btn')?.addEventListener('click', sendChatMessage);
  document.getElementById('chat-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
  });

  // Quick action buttons
  document.querySelectorAll('.qa-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('chat-input');
      if (input) { input.value = btn.dataset.prompt; sendChatMessage(); }
    });
  });
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const msg   = input?.value?.trim();
  if (!msg) return;
  input.value = '';

  showChatMsg('user', msg);
  chatState.messages.push({ role: 'user', content: msg });

  // Show typing
  const typing = document.getElementById('chat-typing');
  if (typing) typing.style.display = 'flex';

  // Call backend or simulate
  if (!DEMO_MODE) {
    fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message:    msg,
        session_id: chatState.sessionId,
        agent_id:   chatState.agentId,
      }),
    })
    .then(r => r.json())
    .then(data => {
      if (typing) typing.style.display = 'none';
      chatState.sessionId = data.session_id;
      chatState.messages.push({ role: 'assistant', content: data.reply });
      showChatMsg('assistant', data.reply);
    })
    .catch(() => {
      if (typing) typing.style.display = 'none';
      showChatMsg('assistant', simulateChatReply(msg));
    });
  } else {
    setTimeout(() => {
      if (typing) typing.style.display = 'none';
      const reply = simulateChatReply(msg);
      chatState.messages.push({ role: 'assistant', content: reply });
      showChatMsg('assistant', reply);
    }, 900 + Math.random() * 600);
  }
}

function showChatMsg(role, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const agentNames = { gemini:'Gemini 1.5 Pro · AAP', llama3:'Llama 3 · AAP', gpt4o:'GPT-4o · AAP', claude:'Claude 3.5 · AAP' };
  const icons      = { gemini:'✦', llama3:'🦙', gpt4o:'⬡', claude:'◈' };
  const agentName  = agentNames[chatState.agentId] || 'AAP';
  const icon       = role === 'user' ? '👤' : (icons[chatState.agentId] || '✦');
  const now        = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const formattedText = renderMarkdown(text);

  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `
    <div class="chat-avatar">${icon}</div>
    <div class="chat-bubble">
      ${role === 'assistant' ? `<div class="chat-agent-name">${agentName}</div>` : ''}
      <div class="chat-text">${formattedText}</div>
      <div class="chat-time">${now}</div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(100,130,200,0.15);padding:1px 6px;border-radius:4px;font-family:monospace">$1</code>')
    .replace(/\n/g, '<br>');
}

function simulateChatReply(msg) {
  const lo = msg.toLowerCase();
  const agents = { gemini:'Gemini 1.5 Pro', llama3:'Llama 3 70B', gpt4o:'GPT-4o', claude:'Claude 3.5 Sonnet' };
  const name   = agents[chatState.agentId] || 'AAP AI';

  // Detect stock
  const stocks = ['reliance','tcs','hdfc','infy','wipro','icicibank','kotakbank','bhartiartl'];
  const hit    = stocks.find(s => lo.includes(s));
  if (hit) {
    const SYM = hit.toUpperCase();
    const stock = NSE_STOCKS[SYM] || { price: 1000 };
    const rsi  = (40 + Math.random() * 30).toFixed(1);
    const action = rsi > 60 ? 'HOLD' : rsi < 40 ? 'SELL' : 'BUY';
    return `**${name} — ${SYM} Analysis**\n\nCurrent Price: ₹${stock.price.toLocaleString('en-IN')}\n\n**Technicals:**\n- RSI(14): ${rsi} → ${rsi>70?'Overbought':rsi<30?'Oversold':'Neutral'}\n- MACD: ${Math.random()>0.5?'Bullish crossover':'Bearish divergence'}\n- Bollinger: ${Math.random()>0.5?'Mid-band, room upward':'Near upper band'}\n- News Sentiment: ${(0.3+Math.random()*0.5).toFixed(2)} (${Math.random()>0.5?'Positive':'Neutral'})\n\n**Recommendation: ${action}**\nRisk Score: ${(0.2+Math.random()*0.5).toFixed(2)}\n\n*This decision will be logged as a PDR on HeLa Chain.*`;
  }

  if (lo.includes('eth') || lo.includes('bitcoin') || lo.includes('btc') || lo.includes('crypto')) {
    return `**${name} — Crypto Market**\n\nETH/USD: $3,214 · 24h: **+2.1%**\nBTC/USD: $67,240 · 24h: **+0.9%**\nMarket Fear/Greed: 72 (Greed)\n\n**Outlook:** Short-term bullish. ETH showing accumulation patterns. Caution: high volatility assets, limit to <10% portfolio allocation.`;
  }

  if (lo.includes('portfolio') || lo.includes('holdings') || lo.includes('p&l')) {
    const total = Object.values(PORTFOLIO_HOLDINGS).reduce((s,h) => s + (NSE_STOCKS[Object.keys(PORTFOLIO_HOLDINGS).find(k=>PORTFOLIO_HOLDINGS[k]===h)]?.price||h.avgCost)*h.qty, 0);
    return `**${name} — Portfolio Summary**\n\nTotal Value: ₹${Math.round(total).toLocaleString('en-IN')}\n\nTop Performer: **TCS** (+8.2%)\nWatch: **WIPRO** (-1.2%)\n\nAgent Recommendation: Maintain core positions. Trim WIPRO by 20% on further weakness. Overall portfolio risk: **MEDIUM**.`;
  }

  if (lo.includes('pdr') || lo.includes('audit') || lo.includes('verify') || lo.includes('trail')) {
    return `**${name} — PDR Audit Trail**\n\nEvery trading decision is recorded as a **PDR (Protocol Decision Record)**:\n\n1. Decision made by AI agent\n2. PDR JSON uploaded to **IPFS** (Pinata)\n3. SHA-256 hash included in **Merkle tree**\n4. Merkle root anchored on **HeLa Chain** (AuditAnchor.sol)\n5. 24h **challenge window** opens\n6. **DAO** can vote to override\n\nThis creates an immutable, tamper-proof audit trail for every trade.`;
  }

  if (lo.includes('mutual fund') || lo.includes('sip') || lo.includes('mf')) {
    return `**${name} — Mutual Fund Picks**\n\nTop SIP recommendations:\n- **Parag Parikh Flexi Cap** — Diversified, consistent 14% 5Y returns\n- **Mirae Asset Large Cap** — Low expense ratio, Nifty50 beater\n- **HDFC Mid-Cap Opp.** — Higher risk, higher potential\n\nSIP as low as ₹500/month. All decisions logged as PDRs.`;
  }

  return `**${name} ready.**\n\nI can help you with:\n- 📊 **Stock Analysis** — *Analyze RELIANCE*, *Should I buy TCS?*\n- Ξ **Crypto** — *ETH price today*, *BTC outlook*\n- 💼 **Portfolio** — *How is my portfolio?*, *P&L summary*\n- 📁 **Mutual Funds** — *Top SIP funds*\n- 🔍 **Audit** — *Explain PDR trail*, *Verify decision*`;
}

// ── Live Ticker ─────────────────────────────────────────────────────────
function initTickerLive() {
  // Duplicate ticker items to make seamless scroll
  const track = document.getElementById('ticker-track');
  if (!track) return;
  const clone = track.innerHTML;
  track.innerHTML = clone + clone;  // duplicate for seamless loop

  // Update prices periodically
  setInterval(updateTickerPrices, 8000);
}

function updateTickerPrices() {
  const track = document.getElementById('ticker-track');
  if (!track) return;
  const items = track.querySelectorAll('.ticker-item');
  items.forEach(item => {
    const sym   = item.querySelector('.tick-sym')?.textContent;
    const stock = NSE_STOCKS[sym];
    if (!stock) return;
    const change = (Math.random() - 0.48) * 0.012;
    stock.price  = +(stock.price * (1 + change)).toFixed(2);
    const chgPct = (change * 100).toFixed(2);
    const up     = change >= 0;
    const priceEl = item.querySelector('.tick-price');
    const chgEl   = item.querySelector('.tick-chg');
    if (priceEl) priceEl.textContent = '₹' + stock.price.toLocaleString('en-IN', {maximumFractionDigits:0});
    if (chgEl)   { chgEl.textContent = (up?'+':'')+chgPct+'%'; chgEl.className = 'tick-chg '+(up?'up':'down'); }
  });
}
