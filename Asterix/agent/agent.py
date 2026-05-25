"""
Financial Crisis Detection Agent
─────────────────────────────────
Pass in market data + news → get back a structured AgentOutput with all 13 indicators.

Pipeline:
  1. Compute 5 chart signals deterministically from raw numbers
  2. Call Claude to run NLP on headlines → 5 news signals + labeled headlines
  3. Compute 3 combined crisis patterns from chart + news results
  4. Score each layer (0–100) and combine into a final crisis_score
  5. Fire alert only when crisis_score >= 70
  6. Persist to SQLite (every run) + JSON file (crisis runs only)

Usage (CLI):
  python agent.py example_input.json
  echo '{...}' | python agent.py -

Usage (library):
  from agent import run_agent
  result = run_agent(data_dict)          # → AgentOutput
  result.to_agent_summary()             # → minimal dict for downstream agents
"""

import anthropic
import json
import os
import sys
from datetime import datetime, timezone

from models import (
    AgentInput, AgentOutput, ScoreBreakdown,
    ChartSignal, NewsSignal, CombinedSignal, NewsHeadline,
)
from signals import (
    compute_chart_signals,
    compute_combined_signals,
    score_signals,
    score_combined,
)
from prompt import build_prompt
from storage import save_to_db, save_to_file


CRISIS_THRESHOLD = 70
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))


def _fallback_news_analysis(inp: AgentInput) -> dict:
    negative_keywords = [
        'loss', 'bearish', 'drop', 'decline', 'warning', 'risk', 'sell', 'weak',
        'miss', 'cut', 'debt', 'default', 'regulation', 'investigation', 'fine'
    ]
    management_keywords = ['ceo', 'executive', 'management', 'resign', 'depart', 'replace']
    debt_keywords = ['debt', 'liquidity', 'default', 'credit', 'bankruptcy']
    regulatory_keywords = ['regulation', 'investigation', 'fine', 'compliance', 'lawsuit']
    earnings_keywords = ['earnings', 'guidance', 'revenue', 'profit', 'loss', 'miss', 'cut']

    def contains_any(text, keywords):
        text = (text or '').lower()
        return any(word in text for word in keywords)

    news_signals = []
    overall_negative = False
    for signal, keywords, weight in [
        ('negative_news_sentiment', negative_keywords, 0.30),
        ('management_change', management_keywords, 0.20),
        ('debt_liquidity_concern', debt_keywords, 0.15),
        ('regulatory_issues', regulatory_keywords, 0.20),
        ('earnings_miss_guidance_cut', earnings_keywords, 0.15),
    ]:
        detected = any(contains_any(item.body, keywords) for item in inp.news)
        severity = 'high' if detected else 'none'
        if signal == 'negative_news_sentiment' and detected:
            overall_negative = True
        news_signals.append({
            'signal': signal,
            'category': 'news',
            'detected': detected,
            'severity': severity,
            'weight': weight,
            'detail': (
                f"Fallback keyword analysis detected '{signal}'" if detected else
                f"Fallback keyword analysis found no {signal.replace('_', ' ')}"
            )
        })

    sentiment_score = 70 if overall_negative else 35
    headlines = []
    for item in inp.news[:5]:
        body = item.body or ''
        sentiment = 'negative' if contains_any(body, negative_keywords) else 'neutral'
        headlines.append({
            'title': item.title,
            'source': item.source or 'NewsAPI',
            'date': item.date,
            'sentiment': sentiment,
            'crisis_relevance': 'high' if sentiment == 'negative' else 'medium',
            'flags': []
        })

    return {
        'company_name': inp.company_name or inp.ticker,
        'news_signals': news_signals,
        'sentiment_risk_score': sentiment_score,
        'crisis_rationale': (
            'Fallback news analysis used because Anthropic API access is unavailable.'
        ),
        'expected_crisis_time': 'N/A',
        'news_headlines': headlines,
        'data_sources_used': ['keyword_sentiment_fallback', 'technical_analysis', 'news_nlp'],
    }


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

def run_agent(raw_input: dict) -> AgentOutput:
    """
    Full crisis detection pipeline.
    Returns an AgentOutput — call .to_agent_summary() for a minimal agent payload.
    """
    inp = AgentInput(**raw_input)

    # ── Step 1: Chart signals (deterministic math) ────────────────────────────
    chart_signal_dicts = compute_chart_signals(inp.market_data)
    chart_score = score_signals(chart_signal_dicts)

    # ── Step 2: News NLP via Claude or fallback if API unavailable ───────────
    if not client.api_key:
        print("[agent] Warning: ANTHROPIC_API_KEY is not set, using fallback news analysis.", flush=True)
        llm = _fallback_news_analysis(inp)
    else:
        try:
            prompt = build_prompt(inp, chart_signal_dicts)
            message = client.messages.create(
                model="claude-opus-4-5",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )
            raw_text = message.content[0].text.strip()
            clean    = raw_text.replace("```json", "").replace("```", "").strip()
            llm = json.loads(clean)
        except Exception as exc:
            print(f"[agent] Warning: Anthropic request failed: {exc}", flush=True)
            llm = _fallback_news_analysis(inp)

    news_signal_dicts: list[dict] = llm.get("news_signals", [])
    news_score: int = llm.get("sentiment_risk_score", score_signals(news_signal_dicts))

    # ── Step 3: Combined crisis patterns ─────────────────────────────────────
    combined_dicts = compute_combined_signals(
        chart_signal_dicts, news_signal_dicts, inp.market_data
    )
    combined_score = score_combined(combined_dicts)

    # ── Step 4: Final crisis score ────────────────────────────────────────────
    crisis_score = round(
        chart_score    * 0.35 +
        news_score     * 0.35 +
        combined_score * 0.30
    )
    alert_triggered = crisis_score >= CRISIS_THRESHOLD

    # ── Step 5: Status label ──────────────────────────────────────────────────
    if crisis_score >= 70:    status = "CRITICAL"
    elif crisis_score >= 50:  status = "WARNING"
    elif crisis_score >= 30:  status = "WATCH"
    else:                     status = "STABLE"

    recommended_action = (
        "FIRE_ALERT"      if alert_triggered else
        "MONITOR_CLOSELY" if crisis_score >= 50 else
        "NO_ACTION"
    )

    # ── Step 6: Build typed output ────────────────────────────────────────────
    output = AgentOutput(
        ticker=inp.ticker,
        company_name=llm.get("company_name") or inp.company_name or inp.ticker,
        scan_timestamp=datetime.now(timezone.utc).isoformat(),
        crisis_threshold=CRISIS_THRESHOLD,

        scores=ScoreBreakdown(
            chart_score=chart_score,
            news_score=news_score,
            combined_score=combined_score,
            crisis_score=crisis_score,
        ),

        alert_triggered=alert_triggered,
        status=status,
        recommended_action=recommended_action,

        crisis_rationale=llm.get("crisis_rationale", ""),
        expected_crisis_time=llm.get("expected_crisis_time"),

        chart_signals=[ChartSignal(**s) for s in chart_signal_dicts],
        news_signals=[NewsSignal(**s) for s in news_signal_dicts],
        combined_signals=[CombinedSignal(**s) for s in combined_dicts],

        news_headlines=[
            NewsHeadline(**h) for h in llm.get("news_headlines", [])
        ],

        data_sources_used=llm.get("data_sources_used", [
            "technical_analysis", "news_nlp", "fundamental_screening"
        ]),
        indicators_evaluated=13,
    )

    # ── Step 7: Persist ───────────────────────────────────────────────────────
    save_to_db(output)
    if output.alert_triggered:
        save_to_file(output)
        _print_crisis_banner(output)

    return output


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def _print_crisis_banner(output: AgentOutput):
    score = output.scores.crisis_score
    print(f"\n{'='*60}", flush=True)
    print(f"  ⚠  CRISIS ALERT — {output.ticker} ({output.company_name})", flush=True)
    print(f"  Crisis Score : {score}/100  |  Status: {output.status}", flush=True)
    print(f"  Chart: {output.scores.chart_score}  News: {output.scores.news_score}  Combined: {output.scores.combined_score}", flush=True)
    print(f"  Expected Time: {output.expected_crisis_time}", flush=True)
    print(f"  {output.crisis_rationale}", flush=True)
    print(f"{'='*60}\n", flush=True)


def main():
    if len(sys.argv) < 2:
        print("Usage:  python agent.py <input.json>")
        print("        echo '{{...}}' | python agent.py -")
        sys.exit(1)

    raw = json.load(sys.stdin if sys.argv[1] == "-" else open(sys.argv[1]))
    result = run_agent(raw)
    print(json.dumps(result.model_dump(), indent=2))


if __name__ == "__main__":
    main()
