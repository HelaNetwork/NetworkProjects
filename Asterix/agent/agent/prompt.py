"""
prompt.py — builds the Claude prompt.

Chart signals (5) are already computed deterministically and injected as facts.
Claude's job:
  - NLP sentiment analysis on each headline
  - Detect all 5 news-based indicators from the headlines
  - Return scored news_signals + labeled news_headlines
  - Provide crisis_rationale tying everything together

News indicators Claude must evaluate:
  1. negative_news_sentiment      — frequent negative coverage, scandals, lawsuits
  2. management_change            — CEO / CFO / board exits signaling instability
  3. debt_liquidity_concern       — payment delays, credit downgrades, drawdowns
  4. regulatory_issues            — audits, bans, SEC/DOJ investigations
  5. earnings_miss_guidance_cut   — missed estimates, lowered forward guidance
  + insider_selling               — detected in news (Form 4 filings, disclosures)
"""

import json
from models import AgentInput
from signals import score_signals


def build_prompt(inp: AgentInput, chart_signals: list[dict]) -> str:
    md = inp.market_data
    chart_score = score_signals(chart_signals)

    # ── News block ────────────────────────────────────────────────────────────
    news_block = "\n".join(
        f"[{i+1}] [{n.date}] {n.source}: {n.title}"
        + (f"\n     excerpt: {n.body[:500].strip()}" if n.body else "")
        for i, n in enumerate(inp.news)
    ) or "No news items provided."

    # ── Chart signals block (pre-computed facts, Claude must not change them) ─
    chart_block = json.dumps(chart_signals, indent=2)

    return f"""You are a financial crisis detection agent analyzing {inp.ticker} ({inp.company_name or inp.ticker}).

═══════════════════════════════════════════════════════
CHART SIGNALS — PRE-COMPUTED (do NOT alter these values)
═══════════════════════════════════════════════════════
{chart_block}

Chart risk score (locked): {chart_score}/100

═══════════════════════════════════════════════════════
MARKET DATA CONTEXT
═══════════════════════════════════════════════════════
Price          : ${md.price:.2f} ({md.price_change_pct:+.2f}% today)
Volume         : {md.volume:,.0f}  (30d avg: {md.avg_volume:,.0f})
RSI-14         : {md.rsi_14:.1f}{f"  (prev: {md.rsi_prev:.1f})" if md.rsi_prev else ""}
MACD           : {md.macd:.3f}  signal: {md.macd_signal:.3f}
ATR            : {f"${md.volatility_atr:.2f}" if md.volatility_atr else "n/a"}
52w High/Low   : {f"${md.high_52w} / ${md.low_52w}" if md.high_52w else "n/a"}
Support        : {f"${md.support_level:.2f}" if md.support_level else "n/a"}
Insider sells  : {md.insider_sell_count_30d if md.insider_sell_count_30d is not None else "n/a"} (30d)
Insider buys   : {md.insider_buy_count_30d  if md.insider_buy_count_30d  is not None else "n/a"} (30d)

═══════════════════════════════════════════════════════
NEWS HEADLINES TO ANALYZE ({len(inp.news)} items)
═══════════════════════════════════════════════════════
{news_block}

═══════════════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════════════
Using ONLY the headlines above, evaluate the 5 news-based crisis indicators
plus insider_selling. Then produce a final crisis assessment.

Return ONLY valid JSON — no markdown fences, no text outside the JSON object:

{{
  "company_name": "<full company name>",
  "sentiment_risk_score": <integer 0-100; NLP score from the news above>,
  "news_signals": [
    {{
      "signal": "negative_news_sentiment",
      "category": "news",
      "detected": <true|false>,
      "severity": "<critical|high|medium|low|none>",
      "weight": 0.20,
      "detail": "<which headlines, what themes: scandals / lawsuits / regulatory pressure>"
    }},
    {{
      "signal": "management_change",
      "category": "news",
      "detected": <true|false>,
      "severity": "<critical|high|medium|low|none>",
      "weight": 0.15,
      "detail": "<who left, role, context — or 'not detected in provided headlines'>"
    }},
    {{
      "signal": "debt_liquidity_concern",
      "category": "news",
      "detected": <true|false>,
      "severity": "<critical|high|medium|low|none>",
      "weight": 0.20,
      "detail": "<payment delays / credit downgrades / credit drawdowns — or 'not detected'>"
    }},
    {{
      "signal": "regulatory_issues",
      "category": "news",
      "detected": <true|false>,
      "severity": "<critical|high|medium|low|none>",
      "weight": 0.20,
      "detail": "<SEC / DOJ / FTC / audit / ban / investigation — or 'not detected'>"
    }},
    {{
      "signal": "earnings_miss_guidance_cut",
      "category": "news",
      "detected": <true|false>,
      "severity": "<critical|high|medium|low|none>",
      "weight": 0.10,
      "detail": "<missed estimates / lowered guidance / revenue warning — or 'not detected'>"
    }},
    {{
      "signal": "insider_selling",
      "category": "news",
      "detected": <true|false>,
      "severity": "<critical|high|medium|low|none>",
      "weight": 0.15,
      "detail": "<Form 4 filings / disclosed insider sales — or 'not detected in headlines'>"
    }}
  ],
  "news_headlines": [
    {{
      "title": "<exact title from the input list>",
      "source": "<source>",
      "date": "<date>",
      "sentiment": "<negative|neutral|positive>",
      "crisis_relevance": "<high|medium|low>",
      "flags": ["<zero or more of: management_change, debt, regulatory, earnings, insider, scandal, lawsuit>"]
    }}
  ],
  "crisis_rationale": "<2-3 sentences, specific, cite actual data points and headlines — explain why crisis_score is what it is>",
  "expected_crisis_time": "<immediate | within 1 week | within 1 month | none>",
  "data_sources_used": ["technical_analysis", "news_nlp", "fundamental_screening"]
}}

Scoring rules for sentiment_risk_score:
  - Each detected news signal contributes proportionally to its weight and severity
  - critical=100%, high=75%, medium=50%, low=25% of that signal's weight
  - 0 = all clear; 100 = every signal critical
  - Be conservative — only score high when the headlines clearly support it
  - Use ONLY the provided headlines — do not invent or assume facts

news_signals weights must be exactly: negative_news_sentiment=0.20, management_change=0.15,
debt_liquidity_concern=0.20, regulatory_issues=0.20, earnings_miss_guidance_cut=0.10, insider_selling=0.15
"""
