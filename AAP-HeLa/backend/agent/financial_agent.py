"""
financial_agent.py — LangGraph-based Financial Trading Agent.

Full pipeline:
  Market Data → Technical Analysis → News Sentiment → Gemini LLM Decision
  → Risk Scoring → Policy Gate → PDR Build → IPFS + HeLa Anchor

Uses Gemini 1.5 Pro as the reasoning brain.
Simulates NSE stock trading (real data, paper execution via alpaca proxy).
"""

import os
import sys
import json
import logging
import hashlib
import time
import uuid
from datetime import datetime
from typing import TypedDict, Optional, Annotated
from pathlib import Path

# ── LangGraph ─────────────────────────────────────────────────────────
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

# ── Gemini ────────────────────────────────────────────────────────────
import google.generativeai as genai

# ── Local modules ─────────────────────────────────────────────────────
sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent.parent / "protocol"))

from market_data   import MarketData, NewsSentiment
from indicators    import TechnicalAnalysis
from risk_scorer   import RiskScorer

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s %(message)s")


# ─── Agent State ────────────────────────────────────────────────────────────
class AgentState(TypedDict):
    """The full state that flows through the LangGraph pipeline."""
    # Input
    symbol:           str
    target_quantity:  int
    portfolio_value:  float
    session_id:       str
    sequence_number:  int

    # Data fetched
    price_data:       dict
    market_breadth:   dict
    indicators:       dict
    news_sentiment:   dict
    fundamentals:     dict

    # Decision
    reasoning_chain:  list[dict]
    action:           str        # BUY / SELL / HOLD
    quantity:         int
    confidence:       float
    alternatives:     list[str]

    # Risk
    risk_result:      dict
    approval_type:    str        # AUTO / MANUAL / BLOCKED

    # PDR
    pdr:              dict
    pdr_hash:         str

    # Execution
    execution_status: str
    error:            Optional[str]


# ─── Node Functions ─────────────────────────────────────────────────────────
market_data   = MarketData()
news_fetcher  = NewsSentiment()
ta_engine     = TechnicalAnalysis()
risk_engine   = RiskScorer()


def node_fetch_market_data(state: AgentState) -> AgentState:
    """Node 1: Fetch price history, current price, market breadth."""
    sym = state["symbol"]
    log.info(f"[Node 1] Fetching market data for {sym}")

    price_snap   = market_data.get_current_price(sym)
    hist_df      = market_data.get_price_history(sym, period="3mo", interval="1d")
    breadth      = market_data.get_market_breadth()
    fundamentals = market_data.get_fundamentals(sym)

    indicators   = ta_engine.compute_all(hist_df)

    state["price_data"]    = price_snap
    state["market_breadth"]= breadth
    state["indicators"]    = indicators
    state["fundamentals"]  = fundamentals
    return state


def node_fetch_news(state: AgentState) -> AgentState:
    """Node 2: Fetch and score news sentiment via Gemini."""
    sym = state["symbol"]
    log.info(f"[Node 2] Fetching news sentiment for {sym}")

    gemini_client = getattr(node_fetch_news, "_gemini_client", None)
    sentiment     = news_fetcher.get_sentiment(sym, gemini_client)
    state["news_sentiment"] = sentiment
    return state


def node_gemini_decision(state: AgentState) -> AgentState:
    """Node 3: Gemini 1.5 Pro builds chain-of-thought and makes trading decision."""
    sym     = state["symbol"]
    price   = state["price_data"]
    ind     = state["indicators"]
    brd     = state["market_breadth"]
    sent    = state["news_sentiment"]
    fund    = state["fundamentals"]

    log.info(f"[Node 3] Gemini reasoning for {sym}")

    prompt = f"""You are an expert financial analyst and trader specializing in Indian NSE stocks.
Analyze the following data for {sym} and make a trading decision.

## Current Price Data
- Current Price: ₹{price.get('current_price', 'N/A')}
- Previous Close: ₹{price.get('prev_close', 'N/A')}
- Change: {price.get('change_pct', 0):.2f}%
- 52W High: ₹{price.get('52w_high', 'N/A')} | 52W Low: ₹{price.get('52w_low', 'N/A')}
- Volume: {price.get('volume', 0):,}

## Technical Indicators
- RSI (14): {ind.get('rsi_14', 'N/A')} [{ind.get('rsi_zone', 'N/A')}]
- MACD: {ind.get('macd', 'N/A')} | Signal: {ind.get('macd_signal', 'N/A')} | Histogram: {ind.get('macd_histogram', 'N/A')}
- MACD Crossover: {ind.get('macd_crossover', 'NONE')}
- Bollinger Band Position: {ind.get('bb_position', 'N/A')}
- Golden Cross: {ind.get('golden_cross', False)} | Death Cross: {ind.get('death_cross', False)}
- Volume Spike: {ind.get('volume_spike', False)} (Ratio: {ind.get('volume_ratio', 1.0):.2f}x)
- Price above SMA50: {ind.get('price_above_sma50', 'N/A')} | SMA200: {ind.get('price_above_sma200', 'N/A')}
- Ichimoku: {ind.get('ichimoku', 'N/A')}
- Candlestick Patterns: {ind.get('candlestick_patterns', [])}
- Overall Technical Signal: {ind.get('overall_signal', 'HOLD')}
- Trend Direction: {ind.get('trend_direction', 'NEUTRAL')}
- Signal Strength: {ind.get('signal_strength', 0.5):.2f}

## Market Breadth
- Nifty 50: {brd.get('nifty50', 'N/A')} ({brd.get('nifty_trend', 'N/A')})
- India VIX: {brd.get('india_vix', 'N/A')} [{brd.get('vix_sentiment', 'N/A')}]

## News Sentiment
- Score: {sent.get('sentiment_score', 0):.3f} [{sent.get('sentiment_label', 'NEUTRAL')}]
- Headlines: {', '.join(sent.get('headlines', [])[:3])}

## Fundamentals
- P/E Ratio: {fund.get('pe_ratio', 'N/A')}
- Sector: {fund.get('sector', 'N/A')}

## Trading Context
- Target Quantity: {state['target_quantity']} shares (~₹{state['target_quantity'] * price.get('current_price', 0):,.0f} value)

## Instructions
Provide your analysis in EXACTLY this JSON format (no markdown, just JSON):
{{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": 0.0-1.0,
  "reasoning_chain": [
    {{"step": 1, "thought": "Technical analysis observation..."}},
    {{"step": 2, "thought": "News/sentiment consideration..."}},
    {{"step": 3, "thought": "Risk/market context..."}},
    {{"step": 4, "thought": "Final decision rationale..."}}
  ],
  "human_explanation": "One clear sentence explaining the decision for non-experts",
  "alternatives_considered": ["OPTION1", "OPTION2"],
  "key_risks": ["risk1", "risk2"],
  "expected_outcome": "e.g., +2-3% in 3-5 days",
  "stop_loss_pct": 2.5,
  "target_pct": 4.0
}}"""

    try:
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))
        model  = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-1.5-pro"))
        resp   = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=1500,
            )
        )
        raw_text = resp.text.strip()
        # Strip markdown if Gemini adds ```json
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        result = json.loads(raw_text)

    except Exception as e:
        log.warning(f"Gemini API error: {e} — using fallback decision logic")
        result = _fallback_decision(state)

    state["action"]          = result.get("action", "HOLD")
    state["confidence"]      = float(result.get("confidence", 0.5))
    state["reasoning_chain"] = result.get("reasoning_chain", [])
    state["alternatives"]    = result.get("alternatives_considered", ["HOLD"])

    # Store extra fields for PDR
    state.setdefault("_gemini_extras", {})
    state["_gemini_extras"] = {
        "human_explanation": result.get("human_explanation", ""),
        "key_risks":         result.get("key_risks", []),
        "expected_outcome":  result.get("expected_outcome", ""),
        "stop_loss_pct":     result.get("stop_loss_pct", 2.5),
        "target_pct":        result.get("target_pct", 4.0),
    }
    return state


def node_risk_check(state: AgentState) -> AgentState:
    """Node 4: Compute risk score and determine approval type."""
    log.info(f"[Node 4] Risk scoring for {state['symbol']} {state['action']}")

    price = float(state["price_data"].get("current_price", 0))
    qty   = state["target_quantity"]

    risk = risk_engine.score(
        symbol=        state["symbol"],
        action=        state["action"],
        quantity=      qty,
        price=         price,
        indicators=    state["indicators"],
        market_data=   state["market_breadth"],
        sentiment=     state["news_sentiment"],
        confidence=    state["confidence"],
        portfolio_pct= qty * price / state["portfolio_value"] * 100 if state["portfolio_value"] > 0 else 0,
    )

    state["risk_result"]   = {
        "score":         risk.score,
        "label":         risk.label,
        "factors":       risk.factors,
        "approval_type": risk.approval_type,
        "block_reason":  risk.block_reason,
    }
    state["approval_type"] = risk.approval_type
    state["quantity"]      = qty if risk.approval_type != "BLOCKED" else 0
    return state


def node_build_pdr(state: AgentState) -> AgentState:
    """Node 5: Build the Per-Decision Record (PDR) JSON."""
    log.info(f"[Node 5] Building PDR for {state['symbol']}")

    price   = state["price_data"]
    ind     = state["indicators"]
    extras  = state.get("_gemini_extras", {})
    risk    = state["risk_result"]

    curr_price = float(price.get("current_price", 0))
    qty        = state.get("quantity", state["target_quantity"])
    trade_val  = qty * curr_price

    stop_loss_pct  = extras.get("stop_loss_pct", 2.5)
    target_pct     = extras.get("target_pct", 4.0)

    pdr = {
        "decision_id":  f"aap_{state['symbol']}_{state['session_id']}_{state['sequence_number']:04d}",
        "timestamp":    datetime.utcnow().isoformat() + "Z",
        "session_id":   state["session_id"],
        "sequence_number": state["sequence_number"],

        "action":       state["action"],
        "asset":        state["symbol"],
        "quantity":     qty,
        "price_at_decision": curr_price,
        "trade_value_inr":   round(trade_val, 2),
        "currency":    "INR",

        "input_features": {
            "rsi_14":           ind.get("rsi_14"),
            "rsi_zone":         ind.get("rsi_zone"),
            "macd":             ind.get("macd"),
            "macd_signal":      ind.get("macd_signal"),
            "macd_crossover":   ind.get("macd_crossover"),
            "bb_position":      ind.get("bb_position"),
            "atr_pct":          ind.get("atr_pct"),
            "volume_ratio":     ind.get("volume_ratio"),
            "volume_spike":     ind.get("volume_spike"),
            "golden_cross":     ind.get("golden_cross"),
            "death_cross":      ind.get("death_cross"),
            "trend_direction":  ind.get("trend_direction"),
            "overall_signal":   ind.get("overall_signal"),
            "signal_strength":  ind.get("signal_strength"),
            "candlestick_patterns": ind.get("candlestick_patterns", []),
            "support_20d":      ind.get("support_20d"),
            "resistance_20d":   ind.get("resistance_20d"),
            "nifty_trend":      state["market_breadth"].get("nifty_trend"),
            "india_vix":        state["market_breadth"].get("india_vix"),
        },

        "external_signals": {
            "news_sentiment_score": state["news_sentiment"].get("sentiment_score"),
            "news_sentiment_label": state["news_sentiment"].get("sentiment_label"),
            "headlines_analyzed":   state["news_sentiment"].get("headlines_used", 0),
            "data_sources":         ["NSE_YF_API_v1", "Gemini_News_v1"],
        },

        "model_info": {
            "model_id":           "aap-fin-agent-v1.0",
            "llm":                os.getenv("GEMINI_MODEL", "gemini-1.5-pro"),
            "model_hash":         hashlib.sha256(b"aap-fin-agent-v1.0").hexdigest()[:16],
            "temperature":        0.2,
        },

        "reasoning_chain":   state["reasoning_chain"],
        "human_explanation": extras.get("human_explanation", ""),
        "key_risks":         extras.get("key_risks", []),

        "confidence_score":  state["confidence"],
        "alternatives_considered": state["alternatives"],
        "expected_outcome":  extras.get("expected_outcome", ""),
        "stop_loss_pct":     stop_loss_pct,
        "stop_loss_price":   round(curr_price * (1 - stop_loss_pct / 100), 2) if state["action"] == "BUY" else None,
        "target_price":      round(curr_price * (1 + target_pct  / 100), 2) if state["action"] == "BUY" else None,

        "rules_triggered":   [f["name"] for f in risk["factors"] if f["value"] > 0.3],
        "risk_score":        risk["label"],
        "risk_score_numeric":risk["score"],
        "risk_factors":      risk["factors"],

        "approval_type":     state["approval_type"],
        "execution_status":  "PENDING_CHALLENGE" if state["approval_type"] == "AUTO" else state["approval_type"].lower(),
        "challenge_window_hours": int(os.getenv("CHALLENGE_WINDOW_HOURS", "24")),

        # Tamper-proof chain (prev_pdr_hash filled by protocol layer)
        "prev_pdr_hash":     None,
        "pdr_hash":          None,   # Computed next
        "ipfs_cid":          None,   # Filled after IPFS upload
        "hela_anchor_tx":    None,   # Filled after on-chain anchor
        "agent_signature":   None,   # Filled after signing
    }

    # Compute PDR hash (excluding mutable fields)
    hashable = {k: v for k, v in pdr.items() if k not in ("pdr_hash", "ipfs_cid", "hela_anchor_tx", "agent_signature")}
    pdr_hash = hashlib.sha256(
        json.dumps(hashable, sort_keys=True, default=str).encode()
    ).hexdigest()

    pdr["pdr_hash"]  = pdr_hash
    state["pdr"]      = pdr
    state["pdr_hash"] = pdr_hash

    log.info(f"[Node 5] PDR built — decision_id={pdr['decision_id']}, hash={pdr_hash[:16]}...")
    return state


def node_set_execution_status(state: AgentState) -> AgentState:
    """Node 6: Final status resolution."""
    approval = state["approval_type"]

    if approval == "BLOCKED":
        state["execution_status"] = "BLOCKED"
        state["pdr"]["execution_status"] = "BLOCKED"
    elif approval == "MANUAL":
        state["execution_status"] = "PENDING_MANUAL_APPROVAL"
        state["pdr"]["execution_status"] = "PENDING_MANUAL_APPROVAL"
    else:
        state["execution_status"] = "PENDING_CHALLENGE"
        state["pdr"]["execution_status"] = "PENDING_CHALLENGE"

    log.info(f"[Node 6] Execution status: {state['execution_status']}")
    return state


def _fallback_decision(state: AgentState) -> dict:
    """Rule-based fallback if Gemini API unavailable."""
    ind    = state["indicators"]
    signal = ind.get("overall_signal", "HOLD")
    rsi    = ind.get("rsi_14", 50.0)
    conf   = ind.get("signal_strength", 0.5)

    action_map = {
        "STRONG_BUY":  "BUY",
        "BUY":         "BUY",
        "HOLD":        "HOLD",
        "SELL":        "SELL",
        "STRONG_SELL": "SELL",
    }
    action = action_map.get(signal, "HOLD")

    return {
        "action":     action,
        "confidence": float(conf),
        "reasoning_chain": [
            {"step": 1, "thought": f"Technical signal: {signal} (RSI: {rsi:.1f})"},
            {"step": 2, "thought": f"Signal strength: {conf:.2f}"},
            {"step": 3, "thought": "Fallback rule-based decision (Gemini unavailable)"},
        ],
        "human_explanation": f"Based on technical analysis ({signal}), decision is to {action}",
        "alternatives_considered": ["HOLD"],
        "key_risks": ["api_unavailable"],
        "expected_outcome": "Unknown (fallback mode)",
        "stop_loss_pct": 2.5,
        "target_pct": 4.0,
    }


# ─── Build the LangGraph ────────────────────────────────────────────────────
def build_agent_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    graph.add_node("fetch_market_data",    node_fetch_market_data)
    graph.add_node("fetch_news",           node_fetch_news)
    graph.add_node("gemini_decision",      node_gemini_decision)
    graph.add_node("risk_check",           node_risk_check)
    graph.add_node("build_pdr",            node_build_pdr)
    graph.add_node("set_execution_status", node_set_execution_status)

    graph.set_entry_point("fetch_market_data")
    graph.add_edge("fetch_market_data",    "fetch_news")
    graph.add_edge("fetch_news",           "gemini_decision")
    graph.add_edge("gemini_decision",      "risk_check")
    graph.add_edge("risk_check",           "build_pdr")
    graph.add_edge("build_pdr",            "set_execution_status")
    graph.add_edge("set_execution_status", END)

    return graph.compile()


# ─── Public API ─────────────────────────────────────────────────────────────
class FinancialAgent:
    """Main agent class. Call .analyze(symbol) to get a PDR."""

    def __init__(self):
        self.graph          = build_agent_graph()
        self.session_id     = str(uuid.uuid4())[:8]
        self.sequence       = 0
        self.portfolio_value= 500_000  # ₹5 Lakh default portfolio

    def analyze(self, symbol: str, quantity: int = 10) -> dict:
        self.sequence += 1

        initial_state: AgentState = {
            "symbol":          symbol,
            "target_quantity": quantity,
            "portfolio_value": self.portfolio_value,
            "session_id":      self.session_id,
            "sequence_number": self.sequence,
            "price_data":      {},
            "market_breadth":  {},
            "indicators":      {},
            "news_sentiment":  {},
            "fundamentals":    {},
            "reasoning_chain": [],
            "action":          "HOLD",
            "quantity":        quantity,
            "confidence":      0.5,
            "alternatives":    [],
            "risk_result":     {},
            "approval_type":   "MANUAL",
            "pdr":             {},
            "pdr_hash":        "",
            "execution_status":"PENDING",
            "error":           None,
        }

        try:
            result = self.graph.invoke(initial_state)
            log.info(f"✓ Analysis complete: {symbol} → {result['action']} (conf={result['confidence']:.2f}, risk={result['risk_result'].get('label','?')})")
            return result["pdr"]
        except Exception as e:
            log.error(f"Agent error for {symbol}: {e}")
            return {"error": str(e), "symbol": symbol}


# ─── CLI Entry Point ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    symbol = sys.argv[1] if len(sys.argv) > 1 else "RELIANCE"
    qty    = int(sys.argv[2]) if len(sys.argv) > 2 else 10

    agent = FinancialAgent()
    pdr   = agent.analyze(symbol, qty)
    print("\n" + "="*60)
    print("AGENT DECISION — Per-Decision Record (PDR)")
    print("="*60)
    print(json.dumps(pdr, indent=2, default=str))
