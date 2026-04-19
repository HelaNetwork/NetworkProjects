"""
signals.py — deterministic computation of all 5 chart-based indicators
and helper logic for the 3 combined crisis patterns.

Chart indicators (all 5):
  1. Unusual Volume Spike + Price Drop   → institutional heavy selling
  2. Lower Highs & Lower Lows           → sustained bearish structure
  3. Breakdown below key support        → loss of investor confidence
  4. RSI Divergence                     → weakening momentum
  5. High Volatility (large candles)    → uncertainty / insider activity

Combined patterns (evaluated after news signals arrive from Claude):
  A. Negative news + price falling with high volume
  B. Insider selling + bearish trend
  C. Repeated bad news cycles + increasing volatility
"""

from typing import Optional


# ─────────────────────────────────────────────────────────────────────────────
# CHART SIGNALS (pure math — no LLM needed)
# ─────────────────────────────────────────────────────────────────────────────

def compute_chart_signals(md) -> list[dict]:
    """
    md: MarketData instance
    Returns a list of 5 ChartSignal-compatible dicts.
    All weights sum to 1.0.
    """
    signals = []

    # ── 1. Unusual Volume Spike + Price Drop ─────────────────────────────────
    # Thesis: heavy institutional selling shows up as 2x+ volume with sharp drop.
    vol_ratio = md.volume / md.avg_volume if md.avg_volume else 1.0
    vol_spike = vol_ratio >= 2.0                    # 2x avg = unusual
    price_drop = md.price_change_pct <= -5.0        # -5% threshold for "heavy"
    detected = vol_spike and price_drop
    is_critical = vol_ratio >= 3.0 and md.price_change_pct <= -8.0
    signals.append({
        "signal": "volume_spike_price_drop",
        "category": "chart",
        "detected": detected,
        "severity": _sev(detected, is_critical, vol_ratio >= 2.5 and price_drop),
        "weight": 0.25,
        "detail": (
            f"Volume {vol_ratio:.1f}x 30d avg | price {md.price_change_pct:+.1f}% today"
            if detected else
            f"Volume {vol_ratio:.1f}x avg | price {md.price_change_pct:+.1f}% — no spike"
        )
    })

    # ── 2. Lower Highs & Lower Lows ──────────────────────────────────────────
    # Thesis: each rally fails lower and each dip sets a new low = bearish structure.
    lh = _is_descending(md.prev_highs)
    ll = _is_descending(md.prev_lows)
    detected = bool(lh and ll)
    # Critical if 3+ consecutive lower highs AND lower lows
    is_critical = (
        _consecutive_descending(md.prev_highs, 3) and
        _consecutive_descending(md.prev_lows, 3)
    )
    highs_str = " > ".join(f"{v:.2f}" for v in md.prev_highs) if md.prev_highs else "n/a"
    lows_str  = " > ".join(f"{v:.2f}" for v in md.prev_lows)  if md.prev_lows  else "n/a"
    signals.append({
        "signal": "lower_highs_lower_lows",
        "category": "chart",
        "detected": detected,
        "severity": _sev(detected, is_critical, detected),
        "weight": 0.20,
        "detail": (
            f"Highs: {highs_str} (descending) | Lows: {lows_str} (descending)"
            if detected else
            f"Highs: {highs_str} | Lows: {lows_str} — no sustained downtrend"
        )
    })

    # ── 3. Breakdown below key support ───────────────────────────────────────
    # Thesis: price closing below a known support level signals loss of confidence.
    has_support = md.support_level is not None
    below = has_support and md.price < md.support_level
    pct_below = ((md.support_level - md.price) / md.support_level * 100) if below else 0.0
    is_critical = below and pct_below >= 5.0   # >5% below support = hard break
    signals.append({
        "signal": "support_breakdown",
        "category": "chart",
        "detected": bool(below),
        "severity": _sev(bool(below), is_critical, below and pct_below >= 2.0),
        "weight": 0.20,
        "detail": (
            f"Price ${md.price:.2f} is {pct_below:.1f}% below support ${md.support_level:.2f}"
            if below else
            f"Price ${md.price:.2f} holding above support ${md.support_level:.2f}"
            if has_support else
            "No support level provided"
        )
    })

    # ── 4. Divergence (RSI up but price down) ────────────────────────────────
    # Thesis: when momentum diverges from price, the trend is running out of energy.
    # Also catches oversold conditions as crisis indicator.
    rsi = md.rsi_14
    rsi_prev = md.rsi_prev

    rsi_oversold     = rsi < 30
    rsi_bearish_div  = (                           # RSI rising but price falling
        rsi_prev is not None and
        rsi > rsi_prev and
        md.price_change_pct < -3.0
    )
    rsi_weakening    = rsi < 45 and md.price_change_pct < -2.0  # soft divergence

    detected = rsi_oversold or rsi_bearish_div or rsi_weakening
    is_critical = rsi_oversold and rsi < 20
    is_high     = rsi_oversold or rsi_bearish_div

    rsi_note = ""
    if rsi_oversold:      rsi_note = f"RSI {rsi:.1f} — deeply oversold"
    elif rsi_bearish_div: rsi_note = f"RSI rising ({rsi_prev:.1f}→{rsi:.1f}) while price {md.price_change_pct:+.1f}% — bearish divergence"
    elif rsi_weakening:   rsi_note = f"RSI {rsi:.1f} weakening with price {md.price_change_pct:+.1f}%"
    else:                 rsi_note = f"RSI {rsi:.1f} — no divergence detected"

    signals.append({
        "signal": "rsi_divergence",
        "category": "chart",
        "detected": detected,
        "severity": _sev(detected, is_critical, is_high),
        "weight": 0.15,
        "detail": rsi_note
    })

    # ── 5. High Volatility (sudden large candles) ─────────────────────────────
    # Thesis: explosive ATR expansion signals uncertainty or insider front-running.
    atr_pct = (md.volatility_atr / md.price * 100) if md.volatility_atr and md.price else None
    atr_expanding = (
        md.volatility_atr_prev is not None and
        md.volatility_atr is not None and
        md.volatility_atr > md.volatility_atr_prev * 1.5   # 50% ATR expansion
    )
    boll_squeeze = (
        md.bollinger_upper is not None and
        md.bollinger_lower is not None and
        md.price < md.bollinger_lower              # price below lower Bollinger band
    )

    detected = (
        (atr_pct is not None and atr_pct >= 5.0) or
        atr_expanding or
        boll_squeeze
    )
    is_critical = (atr_pct is not None and atr_pct >= 10.0) or (atr_expanding and boll_squeeze)
    is_high     = (atr_pct is not None and atr_pct >= 7.0) or atr_expanding

    detail_parts = []
    if atr_pct:        detail_parts.append(f"ATR {atr_pct:.1f}% of price")
    if atr_expanding:  detail_parts.append("ATR expanded 50%+ vs prior period")
    if boll_squeeze:   detail_parts.append(f"Price ${md.price:.2f} below Bollinger lower ${md.bollinger_lower:.2f}")
    if not detail_parts: detail_parts.append("Volatility within normal range")

    signals.append({
        "signal": "high_volatility",
        "category": "chart",
        "detected": detected,
        "severity": _sev(detected, is_critical, is_high),
        "weight": 0.20,
        "detail": " | ".join(detail_parts)
    })

    return signals


# ─────────────────────────────────────────────────────────────────────────────
# COMBINED PATTERNS (evaluated after news signals are known)
# ─────────────────────────────────────────────────────────────────────────────

def compute_combined_signals(
    chart_signals: list[dict],
    news_signals: list[dict],
    md,
) -> list[dict]:
    """
    Evaluates the 3 high-confidence combined crisis patterns.
    Requires both chart and news signal dicts to be populated.

    Pattern A: Negative news + price falling with high volume
    Pattern B: Insider selling + bearish trend
    Pattern C: Repeated bad news cycles + increasing volatility
    """

    def chart_detected(name: str) -> bool:
        return any(s["signal"] == name and s["detected"] for s in chart_signals)

    def news_detected(name: str) -> bool:
        return any(s["signal"] == name and s["detected"] for s in news_signals)

    def chart_severity(name: str) -> str:
        for s in chart_signals:
            if s["signal"] == name:
                return s["severity"]
        return "none"

    combined = []

    # ── Pattern A: Negative news + price falling with high volume ─────────────
    neg_news     = news_detected("negative_news_sentiment")
    vol_selloff  = chart_detected("volume_spike_price_drop")
    trend_down   = chart_detected("lower_highs_lower_lows")
    support_brk  = chart_detected("support_breakdown")

    a_detected = neg_news and vol_selloff
    a_critical = a_detected and (trend_down or support_brk)
    a_contributors = []
    if neg_news:    a_contributors.append("negative_news_sentiment")
    if vol_selloff: a_contributors.append("volume_spike_price_drop")
    if trend_down:  a_contributors.append("lower_highs_lower_lows")
    if support_brk: a_contributors.append("support_breakdown")

    combined.append({
        "pattern": "bad_news_plus_volume_selloff",
        "category": "combined",
        "detected": a_detected,
        "severity": "critical" if a_critical else ("high" if a_detected else "none"),
        "contributing_signals": a_contributors,
        "detail": (
            "Confirmed: negative news coinciding with institutional-scale selloff"
            + (" and loss of structural support" if a_critical else "")
            if a_detected else
            "Pattern not confirmed — requires both negative sentiment and volume selloff"
        )
    })

    # ── Pattern B: Insider selling + bearish trend ────────────────────────────
    insider_sell  = news_detected("insider_selling")
    mgmt_exit     = news_detected("management_change")

    # Also check raw market data for insider sell counts
    insider_data_sell = (
        md.insider_sell_count_30d is not None and
        md.insider_buy_count_30d is not None and
        md.insider_sell_count_30d > md.insider_buy_count_30d * 2  # sell:buy > 2:1
    )
    any_insider = insider_sell or insider_data_sell

    b_detected = any_insider and trend_down
    b_critical = b_detected and mgmt_exit
    b_contributors = []
    if insider_sell or insider_data_sell: b_contributors.append("insider_selling")
    if trend_down:   b_contributors.append("lower_highs_lower_lows")
    if mgmt_exit:    b_contributors.append("management_change")

    combined.append({
        "pattern": "insider_selling_plus_downtrend",
        "category": "combined",
        "detected": b_detected,
        "severity": "critical" if b_critical else ("high" if b_detected else "none"),
        "contributing_signals": b_contributors,
        "detail": (
            "Confirmed: insider distribution aligned with established downtrend"
            + (" — management also exiting" if b_critical else "")
            if b_detected else
            "Pattern not confirmed — requires insider selling concurrent with downtrend"
        )
    })

    # ── Pattern C: Repeated bad news + increasing volatility ─────────────────
    reg_issues   = news_detected("regulatory_issues")
    debt_concern = news_detected("debt_liquidity_concern")
    earnings_bad = news_detected("earnings_miss_guidance_cut")
    high_vol     = chart_detected("high_volatility")
    rsi_div      = chart_detected("rsi_divergence")

    bad_news_count = sum([neg_news, reg_issues, debt_concern, earnings_bad, mgmt_exit, insider_sell])
    c_detected = bad_news_count >= 2 and high_vol
    c_critical = bad_news_count >= 3 and high_vol and rsi_div
    c_contributors = []
    if neg_news:     c_contributors.append("negative_news_sentiment")
    if reg_issues:   c_contributors.append("regulatory_issues")
    if debt_concern: c_contributors.append("debt_liquidity_concern")
    if earnings_bad: c_contributors.append("earnings_miss_guidance_cut")
    if high_vol:     c_contributors.append("high_volatility")
    if rsi_div:      c_contributors.append("rsi_divergence")

    combined.append({
        "pattern": "repeated_bad_news_plus_volatility",
        "category": "combined",
        "detected": c_detected,
        "severity": "critical" if c_critical else ("high" if c_detected else "none"),
        "contributing_signals": c_contributors,
        "detail": (
            f"Confirmed: {bad_news_count} concurrent negative fundamental signals with volatility surge"
            + (" — momentum breakdown also present" if c_critical else "")
            if c_detected else
            f"Pattern not confirmed ({bad_news_count} bad news signal(s), high_vol={high_vol})"
        )
    })

    return combined


# ─────────────────────────────────────────────────────────────────────────────
# SCORING
# ─────────────────────────────────────────────────────────────────────────────

def score_signals(signals: list[dict]) -> int:
    """
    Convert a list of signal dicts (chart or news) into a 0–100 score.
    Weights must sum to 1.0 across the list.
    """
    SEV = {"critical": 1.0, "high": 0.75, "medium": 0.50, "low": 0.25, "none": 0.0}
    total_weight = sum(s["weight"] for s in signals)
    if not total_weight:
        return 0
    weighted = sum(
        s["weight"] * SEV.get(s["severity"], 0.0)
        for s in signals if s["detected"]
    )
    return round((weighted / total_weight) * 100)


def score_combined(combined: list[dict]) -> int:
    """Convert the 3 combined patterns into a 0–100 score."""
    SEV = {"critical": 1.0, "high": 0.75, "medium": 0.50, "low": 0.25, "none": 0.0}
    if not combined:
        return 0
    score = sum(SEV.get(c["severity"], 0.0) for c in combined if c["detected"])
    return round((score / len(combined)) * 100)


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _is_descending(seq: Optional[list[float]]) -> bool:
    if not seq or len(seq) < 2:
        return False
    return all(seq[i] > seq[i + 1] for i in range(len(seq) - 1))


def _consecutive_descending(seq: Optional[list[float]], n: int) -> bool:
    if not seq or len(seq) < n:
        return False
    return all(seq[i] > seq[i + 1] for i in range(n - 1))


def _sev(detected: bool, is_critical: bool, is_high: bool = False) -> str:
    if not detected:
        return "none"
    if is_critical:
        return "critical"
    if is_high:
        return "high"
    return "medium"
