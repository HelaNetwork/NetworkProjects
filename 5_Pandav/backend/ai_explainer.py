from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from config import settings
import threading
import time

# ── Global in-memory caches ────────────────────────────────────────────────
# Keyed by decision_id (int). Persists for the lifetime of the server process.
_explain_cache: dict = {}       # /explain/{id} results
_review_cache: dict  = {}       # tribunal review results

# ── Rate limiter ────────────────────────────────────────────────────────────
# Free tier: 10 RPM → 1 call per 6 seconds.
# We use a lock + minimum interval to serialise LLM calls.
_llm_lock = threading.Lock()
_last_call_ts: float = 0.0
_MIN_INTERVAL: float = 6.5  # seconds between LLM calls


def _rate_limited_invoke(chain, kwargs: dict):
    """Invoke a LangChain chain while respecting the free-tier rate limit."""
    global _last_call_ts
    with _llm_lock:
        now = time.time()
        wait = _MIN_INTERVAL - (now - _last_call_ts)
        if wait > 0:
            print(f"[RateLimit] Waiting {wait:.1f}s before LLM call...")
            time.sleep(wait)
        _last_call_ts = time.time()
        return chain.invoke(kwargs)


class AIExplainer:
    def __init__(self):
        try:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash-lite",
                google_api_key=settings.GOOGLE_API_KEY,
                temperature=0.3
            )
            print("AIExplainer initialized with gemini-2.5-flash-lite (rate-limited, cached)")
        except Exception as e:
            print(f"Failed to initialize AIExplainer: {e}")
            self.llm = None


    def explain_decision(self, decision: dict) -> dict:
        decision_id = decision.get("id")

        # ── Cache hit: return stored result without calling LLM ─────────
        if decision_id is not None and decision_id in _explain_cache:
            print(f"[Cache] explain_decision hit for #{decision_id}")
            return _explain_cache[decision_id]

        if not self.llm:
            return {
                "explanation": "AI explanation unavailable",
                "summary": "AI explainer not initialized",
                "risk": "Unknown",
                "should_challenge": False,
                "decision_id": decision_id,
                "model_used": "None"
            }

        prompt_template = """
You are a financial risk analyst reviewing autonomous AI agent decisions on a blockchain.

An AI agent made the following decision:
- Action: {action}
- Stated Reason: {reason}  
- Amount: {amount} tokens
- Time: {timestamp}
- Status: {status_label}

Provide a structured analysis with exactly these 3 sections:

PLAIN ENGLISH SUMMARY:
(1-2 sentences explaining what the agent did in simple terms anyone can understand)

RISK SCORE:
(Just a single integer from 1 to 10 assessing the risk of this transaction)

SHOULD YOU CHALLENGE:
(Yes/No and a one-sentence reason why or why not)
"""
        try:
            prompt = ChatPromptTemplate.from_template(prompt_template)
            chain = prompt | self.llm | StrOutputParser()

            response = _rate_limited_invoke(chain, {
                "action": decision.get("action"),
                "reason": decision.get("reason"),
                "amount": decision.get("amount"),
                "timestamp": decision.get("timestamp"),
                "status_label": decision.get("status_label")
            })
            
            summary = ""
            risk = 5
            should_challenge_raw = ""
            
            # Simple parsing
            lines = response.split('\n')
            current_section = None
            for line in lines:
                line_stripped = line.strip()
                if "PLAIN ENGLISH SUMMARY:" in line_stripped:
                    current_section = "summary"
                    continue
                elif "RISK SCORE:" in line_stripped:
                    current_section = "risk"
                    continue
                elif "SHOULD YOU CHALLENGE:" in line_stripped:
                    current_section = "challenge"
                    continue
                
                if current_section == "summary" and line_stripped:
                    summary += line_stripped + " "
                elif current_section == "risk" and line_stripped:
                    try:
                        import re
                        digits = re.findall(r'\d+', line_stripped)
                        if digits:
                            risk = int(digits[0])
                    except:
                        pass
                elif current_section == "challenge" and line_stripped:
                    should_challenge_raw += line_stripped + " "
                    
            should_challenge = "yes" in should_challenge_raw.lower()
            
            result = {
                "explanation": response,
                "summary": summary.strip(),
                "risk": risk,
                "should_challenge": should_challenge,
                "decision_id": decision_id,
                "model_used": "gemini-2.5-flash-lite via LangChain"
            }
            # Store in cache
            if decision_id is not None:
                _explain_cache[decision_id] = result
            return result
        except Exception as e:
            return {
                "explanation": "AI explanation unavailable",
                "error": str(e),
                "summary": "AI Error",
                "risk": 5,
                "should_challenge": False,
                "decision_id": decision_id,
                "model_used": "gemini-2.5-flash-lite via LangChain"
            }

    def review_challenge(self, decision: dict) -> dict:
        """
        Tribunal-grade LLM review of a challenged decision.
        Returns a structured verdict: UPHELD (agent was wrong) or REJECTED (agent was right).
        This verdict drives the on-chain resolveDispute call and reputation change.
        """
        decision_id = decision.get("id")

        # Cache hit — tribunal verdict is immutable once set
        if decision_id is not None and decision_id in _review_cache:
            print(f"[Cache] review_challenge hit for #{decision_id}")
            return _review_cache[decision_id]

        if not self.llm:
            return {
                "verdict": "REJECTED",
                "upheld": False,
                "confidence": "Low",
                "reasoning": "AI reviewer unavailable — defaulting to reject challenge.",
                "reputation_delta": 10,
                "decision_id": decision_id,
                "model_used": "None"
            }

        prompt_template = """
You are an autonomous AI tribunal reviewing a challenged blockchain decision made by an AI agent.
The decision was flagged by a governance guardian for review.

DECISION DETAILS:
- Agent Name: {agent_name}
- Action Taken: {action}
- Agent's Stated Reason: {reason}
- Token Amount: {amount}
- Risk Score (1-10): {risk}
- On-Chain Status: {status_label}

YOUR TASK:
Determine whether the challenge against this agent is VALID or NOT.

A challenge is UPHELD (agent was wrong / acted maliciously or recklessly) if:
- The action appears manipulative, exploitative, or financially harmful
- The stated reason does not justify the action or amount
- The risk is unusually high for the declared intent
- There are signs of self-dealing or protocol abuse

A challenge is REJECTED (agent was right / acted correctly) if:
- The action is a routine DeFi operation that aligns with the agent's stated purpose
- The reason is logical and proportionate to the amount
- The action follows standard risk management practices

Respond with EXACTLY this format (no extra text):

VERDICT: [UPHELD or REJECTED]
CONFIDENCE: [High / Medium / Low]
REASONING: [2-3 sentences explaining your verdict]
REPUTATION_IMPACT: [Brief statement on whether the agent should be penalized or rewarded]
"""
        try:
            prompt = ChatPromptTemplate.from_template(prompt_template)
            chain = prompt | self.llm | StrOutputParser()

            response = _rate_limited_invoke(chain, {
                "agent_name": decision.get("agentName", "Unknown Agent"),
                "action": decision.get("action", "Unknown"),
                "reason": decision.get("reason", "No reason provided"),
                "amount": decision.get("amount", 0),
                "risk": decision.get("risk", "Unknown"),
                "status_label": decision.get("status_label", "Challenged"),
            })

            # Parse structured response
            verdict = "REJECTED"
            confidence = "Medium"
            reasoning = ""
            rep_impact = ""

            for line in response.split("\n"):
                line = line.strip()
                if line.startswith("VERDICT:"):
                    raw = line.replace("VERDICT:", "").strip().upper()
                    verdict = "UPHELD" if "UPHELD" in raw else "REJECTED"
                elif line.startswith("CONFIDENCE:"):
                    confidence = line.replace("CONFIDENCE:", "").strip()
                elif line.startswith("REASONING:"):
                    reasoning = line.replace("REASONING:", "").strip()
                elif line.startswith("REPUTATION_IMPACT:"):
                    rep_impact = line.replace("REPUTATION_IMPACT:", "").strip()

            upheld = (verdict == "UPHELD")
            # Contract: upheld=True => -50 rep, upheld=False => +10 rep
            reputation_delta = -50 if upheld else 10

            print(f"[LLM Tribunal] Decision #{decision_id} => {verdict} (confidence: {confidence})")

            result = {
                "verdict": verdict,
                "upheld": upheld,
                "confidence": confidence,
                "reasoning": reasoning or response,
                "reputation_impact_text": rep_impact,
                "reputation_delta": reputation_delta,
                "full_response": response,
                "decision_id": decision_id,
                "model_used": "gemini-2.5-flash-lite via LangChain"
            }
            # Cache the verdict — it's immutable once set
            if decision_id is not None:
                _review_cache[decision_id] = result
            return result
        except Exception as e:
            print(f"[LLM Tribunal ERROR] {e}")
            return {
                "verdict": "REJECTED",
                "upheld": False,
                "confidence": "Low",
                "reasoning": f"AI reviewer error: {str(e)}",
                "reputation_delta": 10,
                "decision_id": decision.get("id"),
                "model_used": "gemini-2.5-flash-lite via LangChain"
            }


    def explain_batch(self, decisions: list[dict]) -> list[dict]:
        results = []
        for d in decisions:
            results.append(self.explain_decision(d))
        return results

    def explain_intent(self, intent: dict) -> dict:
        if not self.llm:
            return {
                "explanation": "AI explanation unavailable",
                "risk_score": 5,
                "model_used": "None"
            }
            
        prompt_template = """
You are a financial risk auditor assessing an autonomous AI agent's proposed intent BEFORE it interacts with a blockchain network.

The agent wants to execute the following intent:
- Action: {action}
- Stated Reason: {reason}  
- Amount: {amount} tokens

Act as a financial auditor. Explain why this agent is moving funds. Is this a typical rebalancing or a high-risk anomaly?
Calculate a Risk Score (1-10, where 1 is safest and 10 is highest risk) based on perceived slippage, contract reputation, and liquidity risks based on the reason provided.

Provide a structured analysis with exactly these 2 sections:

EXPLANATION:
(2-3 sentences explaining your assessment of why the agent is moving funds and whether it's a typical rebalancing or high-risk anomaly)

RISK SCORE:
(Just a single integer from 1 to 10)
"""
        try:
            prompt = ChatPromptTemplate.from_template(prompt_template)
            chain = prompt | self.llm | StrOutputParser()

            response = _rate_limited_invoke(chain, {
                "action": intent.get("action", "Unknown"),
                "reason": intent.get("reason", "No reason provided"),
                "amount": intent.get("amount", 0)
            })

            explanation = ""
            risk_score = 5
            
            lines = response.split('\n')
            current_section = None
            for line in lines:
                line_stripped = line.strip()
                if "EXPLANATION:" in line_stripped:
                    current_section = "explanation"
                    continue
                elif "RISK SCORE:" in line_stripped:
                    current_section = "score"
                    continue
                
                if current_section == "explanation" and line_stripped:
                    explanation += line_stripped + " "
                elif current_section == "score" and line_stripped:
                    try:
                        import re
                        digits = re.findall(r'\d+', line_stripped)
                        if digits:
                            risk_score = int(digits[0])
                    except:
                        pass
                        
            return {
                "explanation": explanation.strip() or response,
                "risk_score": risk_score,
                "model_used": "gemini-2.5-flash-lite via LangChain"
            }
        except Exception as e:
            return {
                "explanation": "AI Error: " + str(e),
                "risk_score": 5,
                "model_used": "gemini-2.5-flash-lite via LangChain"
            }

ai_explainer = AIExplainer()
