"""
risk_scorer.py — Multi-factor risk scoring engine.
Outputs a 0.0–1.0 risk score + detailed risk factors.
"""

import numpy as np
from dataclasses import dataclass
from typing import Optional
import logging

log = logging.getLogger(__name__)


@dataclass
class RiskResult:
    score: float           # 0.0 (no risk) → 1.0 (max risk)
    label: str             # LOW / MEDIUM / HIGH / EXTREME
    factors: list[dict]    # List of risk factors with weights
    approval_type: str     # AUTO / MANUAL
    block_reason: Optional[str]  # If trade should be blocked


class RiskScorer:
    """
    Computes a composite risk score before any trade is executed.
    All weights based on standard risk management principles.
    """

    # Risk boundaries
    AUTO_APPROVE_MAX_SCORE   = 0.35   # Below this → auto-approve
    MANUAL_APPROVAL_MAX_SCORE= 0.70   # Above this → BLOCK (too risky)
    AUTO_APPROVE_LIMIT_INR   = 10_000 # Max value for auto-approve

    def score(
        self,
        symbol:       str,
        action:       str,    # BUY / SELL / HOLD
        quantity:     int,
        price:        float,
        indicators:   dict,
        market_data:  dict,
        sentiment:    dict,
        confidence:   float,
        portfolio_pct: float = 0.0,  # % of portfolio this trade represents
    ) -> RiskResult:

        factors  = []
        scores   = []

        trade_value = quantity * price

        # ── Factor 1: Confidence Score (inverse risk) ──────────────────────
        conf_risk = 1.0 - confidence
        factors.append({"name": "low_confidence", "value": round(conf_risk, 3), "weight": 0.20})
        scores.append(conf_risk * 0.20)

        # ── Factor 2: RSI Zone Risk ────────────────────────────────────────
        rsi = indicators.get("rsi_14", 50.0)
        if action == "BUY":
            rsi_risk = max(0, (rsi - 70) / 30) if rsi > 70 else 0.0  # Overbought risk
        else:
            rsi_risk = max(0, (30 - rsi) / 30) if rsi < 30 else 0.0  # Oversold sell risk
        factors.append({"name": "rsi_risk", "value": round(rsi_risk, 3), "weight": 0.15})
        scores.append(rsi_risk * 0.15)

        # ── Factor 3: Volatility Risk (ATR % of price) ────────────────────
        atr_pct  = indicators.get("atr_pct", 1.5)
        vol_risk = min(1.0, atr_pct / 5.0)  # Scale: 5% ATR = max risk
        factors.append({"name": "volatility_atr", "value": round(vol_risk, 3), "weight": 0.15})
        scores.append(vol_risk * 0.15)

        # ── Factor 4: India VIX ────────────────────────────────────────────
        vix      = market_data.get("india_vix", 15.0)
        vix_risk = min(1.0, max(0, (vix - 12) / 20))  # 12-32 range → 0-1
        factors.append({"name": "india_vix", "value": round(vix_risk, 3), "weight": 0.10})
        scores.append(vix_risk * 0.10)

        # ── Factor 5: News Sentiment Risk ─────────────────────────────────
        sentiment_score = sentiment.get("sentiment_score", 0.0)
        if action == "BUY":
            sent_risk = max(0, -sentiment_score)   # Negative news = risk for buy
        else:
            sent_risk = max(0, sentiment_score)    # Positive news = risk for sell
        factors.append({"name": "sentiment_risk", "value": round(sent_risk, 3), "weight": 0.10})
        scores.append(sent_risk * 0.10)

        # ── Factor 6: Trade Value Risk ─────────────────────────────────────
        # Scale: <10k = low, 10k-100k = medium, >100k = high
        if trade_value <= 10_000:
            val_risk = 0.1
        elif trade_value <= 100_000:
            val_risk = 0.3 + (trade_value - 10_000) / 90_000 * 0.3
        else:
            val_risk = 0.6 + min(0.4, (trade_value - 100_000) / 500_000 * 0.4)
        factors.append({"name": "trade_value", "value": round(val_risk, 3), "weight": 0.15})
        scores.append(val_risk * 0.15)

        # ── Factor 7: Portfolio Concentration ─────────────────────────────
        # If this trade is > 5% of portfolio — red flag
        conc_risk = min(1.0, portfolio_pct / 5.0)
        factors.append({"name": "concentration_risk", "value": round(conc_risk, 3), "weight": 0.10})
        scores.append(conc_risk * 0.10)

        # ── Factor 8: Trend Contra-Trade ──────────────────────────────────
        trend    = indicators.get("trend_direction", "NEUTRAL")
        signal   = indicators.get("overall_signal",  "HOLD")
        contra   = (
            (action == "BUY"  and trend == "BEARISH" and signal in ["SELL", "STRONG_SELL"])
            or (action == "SELL" and trend == "BULLISH" and signal in ["BUY", "STRONG_BUY"])
        )
        contra_risk = 0.6 if contra else 0.0
        factors.append({"name": "contra_trend", "value": contra_risk, "weight": 0.05})
        scores.append(contra_risk * 0.05)

        # ── Composite Score ────────────────────────────────────────────────
        total_score = min(1.0, sum(scores))

        # ── Label ─────────────────────────────────────────────────────────
        if total_score < 0.25:   label = "LOW"
        elif total_score < 0.50: label = "MEDIUM"
        elif total_score < 0.75: label = "HIGH"
        else:                    label = "EXTREME"

        # ── Approval Type ─────────────────────────────────────────────────
        block_reason   = None
        approval_type  = "AUTO"

        if total_score > self.MANUAL_APPROVAL_MAX_SCORE:
            approval_type = "BLOCKED"
            block_reason  = f"Risk score {total_score:.2f} > threshold {self.MANUAL_APPROVAL_MAX_SCORE}"
        elif total_score > self.AUTO_APPROVE_MAX_SCORE or trade_value > self.AUTO_APPROVE_LIMIT_INR:
            approval_type = "MANUAL"
        elif contra:
            approval_type = "MANUAL"
            block_reason  = "Trade is contra-trend"

        # Hard block: extreme VIX
        if vix > 30:
            approval_type = "BLOCKED"
            block_reason  = f"India VIX too high ({vix:.1f}). Extreme market fear."

        return RiskResult(
            score=        round(total_score, 4),
            label=        label,
            factors=      factors,
            approval_type=approval_type,
            block_reason= block_reason,
        )

    def portfolio_impact(
        self,
        trade_value_inr: float,
        portfolio_value_inr: float
    ) -> dict:
        pct = (trade_value_inr / portfolio_value_inr * 100) if portfolio_value_inr > 0 else 0
        return {
            "trade_value_inr":   round(trade_value_inr, 2),
            "portfolio_value_inr": round(portfolio_value_inr, 2),
            "portfolio_pct":     round(pct, 2),
            "exceeds_limit":     pct > 5.0,  # PolicyRegistry: MAX_PORTFOLIO_PCT = 5%
        }
