"""
AAP — Multi-Agent Orchestrator
Routes to Gemini, GPT-4o, Claude 3.5, or Llama3 (Groq)
based on user reputation and risk score.
"""
from __future__ import annotations
import os, time, logging
from typing import Generator

logger = logging.getLogger(__name__)

# ── Agent registry ─────────────────────────────────────────────────────
AGENT_REGISTRY = {
    "llama3": {
        "name":     "Llama 3 70B",
        "provider": "groq",
        "model":    "llama3-70b-8192",
        "min_rep":  0,
        "max_risk": 1.0,
        "icon":     "🦙",
        "badge":    "Fast · Free",
        "color":    "#ffb300",
    },
    "gemini": {
        "name":     "Gemini 1.5 Pro",
        "provider": "google",
        "model":    "gemini-1.5-pro",
        "min_rep":  10,
        "max_risk": 0.7,
        "icon":     "✦",
        "badge":    "Standard",
        "color":    "#00d4ff",
    },
    "gpt4o": {
        "name":     "GPT-4o",
        "provider": "openai",
        "model":    "gpt-4o",
        "min_rep":  40,
        "max_risk": 0.5,
        "icon":     "⬡",
        "badge":    "Advanced",
        "color":    "#00e676",
    },
    "claude": {
        "name":     "Claude 3.5 Sonnet",
        "provider": "anthropic",
        "model":    "claude-3-5-sonnet-20241022",
        "min_rep":  70,
        "max_risk": 0.3,
        "icon":     "◈",
        "badge":    "Elite",
        "color":    "#a78bfa",
    },
}


class AgentOrchestrator:
    """Routes prompts to the appropriate LLM based on user trust level."""

    def get_available_agents(self, reputation: int = 0, risk_score: float = 1.0) -> list[dict]:
        """Return agents this user is allowed to access."""
        available = []
        for agent_id, cfg in AGENT_REGISTRY.items():
            unlocked = (reputation >= cfg["min_rep"] and risk_score <= cfg["max_risk"])
            available.append({
                "id":       agent_id,
                "unlocked": unlocked,
                "reason":   None if unlocked else (
                    f"Requires reputation ≥ {cfg['min_rep']}" if reputation < cfg["min_rep"]
                    else f"Only available when risk score ≤ {cfg['max_risk']}"
                ),
                **cfg,
            })
        return available

    def route(self, agent_id: str, messages: list[dict], context: dict = None) -> str:
        """Route a chat message to the correct LLM provider."""
        cfg = AGENT_REGISTRY.get(agent_id)
        if not cfg:
            return f"Unknown agent: {agent_id}"

        provider  = cfg["provider"]
        model     = cfg["model"]
        sys_prompt = self._build_system_prompt(context or {})

        try:
            if provider == "google":
                return self._call_gemini(model, messages, sys_prompt)
            elif provider == "openai":
                return self._call_openai(model, messages, sys_prompt)
            elif provider == "anthropic":
                return self._call_anthropic(model, messages, sys_prompt)
            elif provider == "groq":
                return self._call_groq(model, messages, sys_prompt)
        except Exception as e:
            logger.warning(f"[{agent_id}] failed: {e}. Falling back to simulation.")
            return self._simulate_response(agent_id, messages, context)

    def _build_system_prompt(self, context: dict) -> str:
        portfolio_summary = ""
        if context.get("portfolio"):
            p = context["portfolio"]
            portfolio_summary = f"\nUser portfolio: total ₹{p.get('total_value', 0):,.0f}, P&L {p.get('pnl_pct', 0):.2f}%"
        return (
            "You are AAP — an AI financial audit and trading assistant running on HeLa blockchain. "
            "You help users analyze NSE stocks, crypto, and mutual funds. "
            "Every trade decision is logged as a tamper-proof PDR record on-chain. "
            "Be concise, data-driven, and always mention risk. "
            "Format numbers in Indian numbering (lakhs/crores)."
            + portfolio_summary
        )

    def _call_gemini(self, model: str, messages: list[dict], sys: str) -> str:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        gm = genai.GenerativeModel(model, system_instruction=sys)
        chat = gm.start_chat()
        for m in messages[:-1]:
            chat.send_message(m["content"])
        resp = chat.send_message(messages[-1]["content"])
        return resp.text

    def _call_openai(self, model: str, messages: list[dict], sys: str) -> str:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        full_msgs = [{"role": "system", "content": sys}] + messages
        resp = client.chat.completions.create(model=model, messages=full_msgs, max_tokens=1024)
        return resp.choices[0].message.content

    def _call_anthropic(self, model: str, messages: list[dict], sys: str) -> str:
        import anthropic
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        resp = client.messages.create(
            model=model, system=sys, messages=messages, max_tokens=1024
        )
        return resp.content[0].text

    def _call_groq(self, model: str, messages: list[dict], sys: str) -> str:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        full_msgs = [{"role": "system", "content": sys}] + messages
        resp = client.chat.completions.create(model=model, messages=full_msgs, max_tokens=1024)
        return resp.choices[0].message.content

    def _simulate_response(self, agent_id: str, messages: list[dict], context: dict) -> str:
        """Simulation fallback when API keys are not configured."""
        last = messages[-1]["content"].lower() if messages else ""
        cfg  = AGENT_REGISTRY.get(agent_id, {})
        name = cfg.get("name", "AAP AI")

        if any(w in last for w in ["reliance", "tcs", "hdfc", "infy", "wipro", "icici", "kotak"]):
            sym = next((w.upper() for w in ["reliance","tcs","hdfc","infy","wipro","icicibank","kotakbank"] if w in last), "RELIANCE")
            return (
                f"**{name} Analysis — {sym}**\n\n"
                f"Based on current technicals:\n"
                f"- RSI(14): 52.4 → Neutral zone, no overbought signal\n"
                f"- MACD: Bullish crossover forming, momentum building\n"
                f"- Bollinger Band position: Mid-band, room to move up\n"
                f"- News sentiment: +0.62 (Positive)\n\n"
                f"**Recommendation: BUY** with caution. Risk score: MEDIUM (0.42)\n"
                f"Suggested position: ≤5% of portfolio. Stop-loss: -4%.\n\n"
                f"*This decision will be logged as a PDR and anchored on HeLa Chain.*"
            )
        elif any(w in last for w in ["eth", "bitcoin", "btc", "crypto", "sol"]):
            return (
                f"**{name} Crypto Analysis**\n\n"
                f"ETH/USD: $2,847 · 24h: +2.3%\n"
                f"BTC/USD: $67,240 · 24h: +1.1%\n"
                f"Market sentiment: Greedy (index: 72)\n\n"
                f"**Outlook**: Short-term bullish, ETH showing accumulation pattern. "
                f"Caution: high volatility, position sizing critical.\n\n"
                f"Risk: HIGH for crypto. Only allocate what you can lose."
            )
        elif any(w in last for w in ["portfolio", "holdings", "pnl", "p&l"]):
            return (
                f"**{name} Portfolio Summary**\n\n"
                f"Your portfolio is performing **+5.6% today** 📈\n\n"
                f"Top performer: **TCS** (+8.2%) — Bullish momentum\n"
                f"Underperformer: **WIPRO** (-1.2%) — Watch for support\n\n"
                f"Agent recommendation: Trim WIPRO position by 20%, add to TCS on dips.\n"
                f"Portfolio risk score: **MEDIUM (0.44)**"
            )
        else:
            return (
                f"**{name} ready.**\n\n"
                f"I can help you with:\n"
                f"- 📊 **Stock Analysis** — Ask: *Analyze RELIANCE* or *Should I buy TCS?*\n"
                f"- 💰 **Crypto** — Ask: *What's ETH doing today?*\n"
                f"- 📁 **Portfolio** — Ask: *How is my portfolio performing?*\n"
                f"- 🔍 **Audit** — Ask: *Verify my last decision*\n\n"
                f"All decisions are logged as tamper-proof PDRs on HeLa Chain."
            )
