"""
models.py — data contracts for the financial crisis detection agent.

Covers all 13 indicators:
  Chart-based (5):  volume_spike_price_drop, lower_highs_lower_lows,
                    support_breakdown, rsi_divergence, high_volatility
  News-based  (5):  negative_sentiment, management_change, debt_liquidity,
                    regulatory_issues, earnings_miss_guidance_cut
  Combined    (3):  bad_news_plus_volume_selloff, insider_selling_plus_downtrend,
                    repeated_bad_news_plus_volatility
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal


# ─────────────────────────────────────────────────────────────────────────────
# INPUT
# ─────────────────────────────────────────────────────────────────────────────

class MarketData(BaseModel):
    # ── Core price / volume ───────────────────────────────────────────────────
    price: float                                        # current price
    price_change_pct: float                             # % change today
    volume: float                                       # today's volume (shares)
    avg_volume: float                                   # 30-day average volume

    # ── Momentum oscillators ─────────────────────────────────────────────────
    rsi_14: float                                       # RSI(14)
    rsi_prev: Optional[float] = None                   # RSI prior period (divergence)
    macd: float                                         # MACD line
    macd_signal: float                                  # MACD signal line
    macd_histogram: Optional[float] = None             # macd - signal
    macd_histogram_prev: Optional[float] = None        # prior bar (momentum shift)

    # ── Trend structure ───────────────────────────────────────────────────────
    prev_highs: Optional[list[float]] = None           # last 3+ swing highs, oldest first
    prev_lows: Optional[list[float]] = None            # last 3+ swing lows,  oldest first

    # ── Support / resistance ─────────────────────────────────────────────────
    support_level: Optional[float] = None
    resistance_level: Optional[float] = None

    # ── Range context ─────────────────────────────────────────────────────────
    high_52w: Optional[float] = None
    low_52w: Optional[float] = None

    # ── Volatility ────────────────────────────────────────────────────────────
    volatility_atr: Optional[float] = None             # ATR (absolute $)
    volatility_atr_prev: Optional[float] = None        # prior ATR (detect expansion)
    bollinger_upper: Optional[float] = None
    bollinger_lower: Optional[float] = None

    # ── Insider / institutional flow ─────────────────────────────────────────
    insider_sell_count_30d: Optional[int] = None       # sell transactions last 30d
    insider_buy_count_30d: Optional[int] = None        # buy transactions last 30d
    institutional_net_flow_pct: Optional[float] = None # % change institutional ownership


class NewsItem(BaseModel):
    title: str
    source: str
    date: str                   # YYYY-MM-DD
    body: Optional[str] = None  # article text; first 500 chars used


class AgentInput(BaseModel):
    ticker: str
    company_name: Optional[str] = None
    market_data: MarketData
    news: list[NewsItem] = Field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# SIGNALS
# ─────────────────────────────────────────────────────────────────────────────

SeverityLevel = Literal["critical", "high", "medium", "low", "none"]


class ChartSignal(BaseModel):
    """One of the 5 chart / market-based indicators (computed deterministically)."""
    signal: str             # snake_case identifier
    category: Literal["chart"] = "chart"
    detected: bool
    severity: SeverityLevel
    weight: float           # contribution weight; all 5 sum to 1.0
    detail: str             # specific numeric finding


class NewsSignal(BaseModel):
    """One of the 5 news / fundamental indicators (NLP via Claude)."""
    signal: str
    category: Literal["news"] = "news"
    detected: bool
    severity: SeverityLevel
    weight: float
    detail: str


class CombinedSignal(BaseModel):
    """One of the 3 high-confidence combined patterns."""
    pattern: str
    category: Literal["combined"] = "combined"
    detected: bool
    severity: SeverityLevel
    contributing_signals: list[str]   # which individual signals fired
    detail: str


class NewsHeadline(BaseModel):
    title: str
    source: str
    date: str
    sentiment: Literal["negative", "neutral", "positive"]
    crisis_relevance: Literal["high", "medium", "low"]
    flags: list[str] = Field(default_factory=list)
    # flags: subset of [management_change, debt, regulatory, earnings, insider, scandal]


# ─────────────────────────────────────────────────────────────────────────────
# OUTPUT
# ─────────────────────────────────────────────────────────────────────────────

class ScoreBreakdown(BaseModel):
    chart_score: int        # 0–100 from the 5 chart indicators   (weight 0.35)
    news_score: int         # 0–100 from the 5 news indicators    (weight 0.35)
    combined_score: int     # 0–100 from the 3 combined patterns  (weight 0.30)
    crisis_score: int       # final: chart*0.35 + news*0.35 + combined*0.30


class AgentOutput(BaseModel):
    # ── Identity ──────────────────────────────────────────────────────────────
    ticker: str
    company_name: str
    scan_timestamp: str         # ISO 8601 UTC
    crisis_threshold: int = 70

    # ── Scores ────────────────────────────────────────────────────────────────
    scores: ScoreBreakdown

    # ── Decision ──────────────────────────────────────────────────────────────
    alert_triggered: bool       # True only when crisis_score >= 70
    status: Literal["CRITICAL", "WARNING", "WATCH", "STABLE"]
    recommended_action: Literal["FIRE_ALERT", "MONITOR_CLOSELY", "NO_ACTION"]

    # ── Explanation ───────────────────────────────────────────────────────────
    crisis_rationale: str
    expected_crisis_time: Optional[str] = None

    # ── All 13 signals ────────────────────────────────────────────────────────
    chart_signals: list[ChartSignal] = Field(default_factory=list)       # 5
    news_signals: list[NewsSignal] = Field(default_factory=list)         # 5
    combined_signals: list[CombinedSignal] = Field(default_factory=list) # 3

    # ── News NLP ──────────────────────────────────────────────────────────────
    news_headlines: list[NewsHeadline] = Field(default_factory=list)

    # ── Metadata ──────────────────────────────────────────────────────────────
    data_sources_used: list[str] = Field(default_factory=list)
    indicators_evaluated: int = 13

    def to_agent_summary(self) -> dict:
        """Minimal JSON for downstream agents — decision layer only."""
        return {
            "ticker": self.ticker,
            "company_name": self.company_name,
            "scan_timestamp": self.scan_timestamp,
            "crisis_score": self.scores.crisis_score,
            "chart_score": self.scores.chart_score,
            "news_score": self.scores.news_score,
            "combined_score": self.scores.combined_score,
            "alert_triggered": self.alert_triggered,
            "status": self.status,
            "recommended_action": self.recommended_action,
            "crisis_rationale": self.crisis_rationale,
            "expected_crisis_time": self.expected_crisis_time,
            "chart_signals_triggered": [s.signal for s in self.chart_signals if s.detected],
            "news_signals_triggered": [s.signal for s in self.news_signals if s.detected],
            "combined_patterns_triggered": [c.pattern for c in self.combined_signals if c.detected],
        }
