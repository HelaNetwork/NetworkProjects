# Financial Crisis Detection Agent

Pure analysis agent — you pass in data, it detects, scores, and decides.
No scraping. No live feeds. Your backend handles data collection.

## Setup

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...

# optional
export CRISIS_DB_PATH=crisis_agent.db
export CRISIS_ALERTS_DIR=crisis_alerts
```

## Run

```bash
python agent.py example_input.json
echo '{...}' | python agent.py -
```

## Library usage

```python
from agent import run_agent

result = run_agent(data_dict)

result.scores.crisis_score      # 0-100 final score
result.scores.chart_score       # from 5 chart indicators
result.scores.news_score        # from 5 news indicators
result.scores.combined_score    # from 3 combined patterns

result.alert_triggered          # True only when crisis_score >= 70
result.status                   # CRITICAL | WARNING | WATCH | STABLE
result.recommended_action       # FIRE_ALERT | MONITOR_CLOSELY | NO_ACTION
result.crisis_rationale         # plain-English explanation

result.chart_signals            # list[ChartSignal]  — all 5
result.news_signals             # list[NewsSignal]   — all 5
result.combined_signals         # list[CombinedSignal] — all 3

result.to_agent_summary()       # minimal dict for downstream agents
```

---

## All 13 Indicators

### Chart-Based (5) — computed deterministically from raw numbers

| Signal | Trigger |
|---|---|
| volume_spike_price_drop | Volume >= 2x 30d avg AND price drop >= 5% |
| lower_highs_lower_lows | Each swing high and low is lower than the last |
| support_breakdown | Price closes below the provided support_level |
| rsi_divergence | RSI < 30, or RSI rising while price falls, or RSI < 45 with >= 2% drop |
| high_volatility | ATR >= 5% of price, ATR expanded 50%+ vs prior, or price below Bollinger lower band |

### News-Based (5+1) — NLP via Claude

| Signal | What Claude looks for |
|---|---|
| negative_news_sentiment | Frequent negative coverage, scandals, lawsuits |
| management_change | CEO / CFO / board exits signaling instability |
| debt_liquidity_concern | Payment delays, credit downgrades, credit drawdowns |
| regulatory_issues | SEC / DOJ / FTC investigations, audits, bans |
| earnings_miss_guidance_cut | Missed estimates, lowered guidance, revenue warnings |
| insider_selling | Form 4 filings, disclosed insider sales in headlines |

### Combined High-Confidence Patterns (3) — cross-layer logic

| Pattern | Triggers when |
|---|---|
| bad_news_plus_volume_selloff | negative_news_sentiment + volume_spike_price_drop |
| insider_selling_plus_downtrend | insider_selling (news or raw data) + lower_highs_lower_lows |
| repeated_bad_news_plus_volatility | 2+ news signals + high_volatility |

---

## Scoring Formula

```
crisis_score = chart_score * 0.35
             + news_score  * 0.35
             + combined    * 0.30
```

Alert fires ONLY when crisis_score >= 70.
Severity multipliers: critical=1.0, high=0.75, medium=0.50, low=0.25

---

## Required Input Fields

ticker, price, price_change_pct, volume, avg_volume, rsi_14, macd, macd_signal

All other fields (rsi_prev, bollinger bands, ATR prev, insider counts, etc.) are optional.
Signals degrade gracefully when data is absent.

## Storage

Every scan: crisis_agent.db (SQLite)
Crisis alerts only (score >= 70): crisis_alerts/{TICKER}_{timestamp}_score{N}.json

```python
from storage import get_history, get_all_alerts
history = get_history("BYND", limit=10)
alerts  = get_all_alerts()
```
