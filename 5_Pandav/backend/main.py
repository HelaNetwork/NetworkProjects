from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import uuid
from config import settings
from blockchain import blockchain_service
from ai_explainer import ai_explainer

app = FastAPI(title="Agentic Protocol API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

intents_db = {}           # Pending intent queue (Command Center)
review_results = {}       # LLM tribunal results keyed by decision_id

@app.on_event("startup")
async def startup_event():
    try:
        chain_info = blockchain_service.get_chain_info()
        if chain_info.get("connected"):
            print(f"Connected to HeLa Testnet, block #{chain_info.get('block_number')}")
        else:
            print("Failed to connect to HeLa Testnet")
    except Exception as e:
        print(f"Startup HeLa connection warning: {e}")
        
    print(f"Contract loaded: {settings.CONTRACT_ADDRESS}")
    print("AI Explainer ready (Gemini via LangChain)")
    print("Server running on http://0.0.0.0:8000")

# --- HEALTH & INFO ---

@app.get("/health")
def get_health():
    try:
        chain_info = blockchain_service.get_chain_info()
        return {
            "status": "ok",
            "hela_connected": chain_info.get("connected"),
            "chain_id": chain_info.get("chain_id"),
            "block_number": chain_info.get("block_number"),
            "contract_address": settings.CONTRACT_ADDRESS
        }
    except HTTPException as e:
        return {"status": "error", "error": e.detail}
    except Exception as e:
        raise HTTPException(status_code=503, detail={"error": "HeLa blockchain unreachable"})

@app.get("/governance")
def get_governance_role():
    try:
        return {"governanceRole": blockchain_service.contract.functions.governanceRole().call()}
    except Exception as e:
        # Fallback to the current server wallet if the contract call fails
        return {"governanceRole": settings.PRIVATE_KEY}

# --- DECISIONS ---

@app.get("/decisions")
def get_decisions():
    try:
        decisions = blockchain_service.get_all_decisions()
        return {
            "decisions": decisions,
            "total": len(decisions),
            "hela_explorer": "https://testnet-blockexplorer.helachain.com"
        }
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@app.get("/decisions/{id}")
def get_decision(id: int):
    try:
        return blockchain_service.get_decision(id)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

# --- AI EXPLANATION ---

class BatchRequest(BaseModel):
    ids: list[int]

@app.get("/explain/all")
def explain_all_decisions():
    """
    Return risk scores for ALL on-chain decisions in one call.
    Results are served from cache (no LLM call) when already computed.
    Only uncached decisions will trigger LLM calls (rate-limited, sequential).
    """
    from ai_explainer import _explain_cache
    try:
        decisions = blockchain_service.get_all_decisions()
        results = []
        for d in decisions:
            d_id = d.get("id")
            if d_id in _explain_cache:
                # Serve from cache — no LLM call
                cached = _explain_cache[d_id]
                results.append({
                    "decision_id": d_id,
                    "risk": cached.get("risk"),
                    "should_challenge": cached.get("should_challenge"),
                    "cached": True,
                })
            else:
                # Queue for lazy loading — return null so frontend shows spinner
                results.append({
                    "decision_id": d_id,
                    "risk": None,
                    "should_challenge": None,
                    "cached": False,
                })
        return {"results": results, "total": len(results)}
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@app.get("/explain/{id}")
def explain_decision_endpoint(id: int):
    try:
        decision = blockchain_service.get_decision(id)
        explanation = ai_explainer.explain_decision(decision)
        return {
            "decision_id": id,
            "decision": decision,
            "explanation": explanation.get("explanation"),
            "summary": explanation.get("summary"),
            "risk": explanation.get("risk"),
            "should_challenge": explanation.get("should_challenge"),
            "cached": False,  # LLM was directly called
            "model_used": explanation.get("model_used")
        }
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@app.post("/explain/batch")
def explain_batch_endpoint(req: BatchRequest):
    """Explain a batch of decisions sequentially (rate-limited, cached)."""
    decisions = []
    for d_id in req.ids:
        try:
            d = blockchain_service.get_decision(d_id)
            decisions.append(d)
        except Exception:
            pass
    explanations = ai_explainer.explain_batch(decisions)
    return explanations

@app.delete("/explain/cache")
def clear_explain_cache():
    """Clear the LLM explanation cache (admin use)."""
    from ai_explainer import _explain_cache, _review_cache
    n = len(_explain_cache) + len(_review_cache)
    _explain_cache.clear()
    _review_cache.clear()
    return {"cleared": n, "message": "Caches cleared"}

# --- CHALLENGE + LLM REVIEW ---

# In-progress challenge state store: { decision_id: "pending" | "reviewing" | result_dict }

class ChallengeRequest(BaseModel):
    challenger_address: str = ""


def _background_llm_review(decision_id: int, decision: dict):
    """
    Run after a successful challengeDecision tx.
    1. Asks Gemini tribunal to UPHOLD or REJECT the challenge.
    2. Calls resolveDispute(id, upheld) on-chain → adjusts agent reputation.
    3. Stores result in review_results for the frontend to poll.
    """
    import time as _time
    print(f"[Tribunal] Starting LLM review for Decision #{decision_id}...")
    review_results[decision_id] = {"status": "reviewing", "decision_id": decision_id}

    try:
        verdict = ai_explainer.review_challenge(decision)
        upheld = verdict.get("upheld", False)

        # Resolve dispute on-chain → this adjusts agentReputations in the smart contract
        resolve_tx = blockchain_service.resolve_dispute(decision_id, upheld)
        print(f"[Tribunal] resolveDispute tx: {resolve_tx}")

        # Fetch updated reputation
        agent_name = decision.get("agentName", "")
        new_reputation = None
        try:
            new_reputation = int(blockchain_service.contract.functions.getReputation(agent_name).call())
        except Exception:
            pass

        result = {
            "status": "complete",
            "decision_id": decision_id,
            "agent_name": agent_name,
            "verdict": verdict.get("verdict"),
            "upheld": upheld,
            "confidence": verdict.get("confidence"),
            "reasoning": verdict.get("reasoning"),
            "reputation_delta": verdict.get("reputation_delta"),
            "reputation_impact_text": verdict.get("reputation_impact_text"),
            "new_reputation": new_reputation,
            "resolve_tx_hash": resolve_tx,
            "resolve_explorer_url": f"https://testnet-blockexplorer.helachain.com/tx/{resolve_tx}",
            "model_used": verdict.get("model_used"),
            "full_llm_response": verdict.get("full_response"),
        }
        review_results[decision_id] = result
        print(f"[Tribunal] Decision #{decision_id} verdict={verdict.get('verdict')}, reputation_delta={verdict.get('reputation_delta')}")

    except Exception as e:
        print(f"[Tribunal ERROR] Decision #{decision_id}: {e}")
        review_results[decision_id] = {
            "status": "error",
            "decision_id": decision_id,
            "error": str(e)
        }


@app.post("/challenge/{id}")
def challenge_decision_endpoint(id: int, req: ChallengeRequest, background_tasks: BackgroundTasks):
    """
    1. Submits challengeDecision(id) on-chain (governance key).
    2. Kicks off background LLM tribunal review.
    3. Returns immediately with tx_hash — frontend polls GET /review/{id} for the verdict.
    """
    try:
        decision = blockchain_service.get_decision(id)

        if not decision.get("is_challengeable"):
            current_time = int(time.time())
            expired_at = decision.get("timestamp", 0) + settings.CHALLENGE_WINDOW_SECONDS
            if current_time > expired_at:
                raise HTTPException(
                    status_code=400,
                    detail={"error": "Challenge window closed", "expired_at": expired_at}
                )
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Decision not challengeable. Current status: {decision.get('status_label')}"
                )

        # Submit the challenge on-chain
        w3 = blockchain_service.w3
        account = w3.eth.account.from_key(settings.PRIVATE_KEY)
        nonce = w3.eth.get_transaction_count(account.address, 'pending')

        tx = blockchain_service.contract.functions.challengeDecision(id).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, settings.PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_hash_hex = w3.to_hex(tx_hash)
        print(f"[Challenge] Decision #{id} challenged. TxHash: {tx_hash_hex}")

        # Mark review as pending immediately so frontend can start polling
        review_results[id] = {"status": "pending", "decision_id": id}

        # Fire background LLM review (non-blocking)
        background_tasks.add_task(_background_llm_review, id, decision)

        return {
            "success": True,
            "message": f"Decision #{id} challenged on HeLa. LLM tribunal review started.",
            "tx_hash": tx_hash_hex,
            "decision_id": id,
            "challenger": req.challenger_address or account.address,
            "review_url": f"/review/{id}",
            "hela_explorer_url": f"https://testnet-blockexplorer.helachain.com/tx/{tx_hash_hex}"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Challenge ERROR] {e}")
        raise HTTPException(status_code=500, detail={"error": "Challenge transaction failed", "message": str(e)})


@app.get("/review/{id}")
def get_review_result(id: int):
    """
    Poll endpoint for LLM tribunal result.
    Returns status: 'pending' | 'reviewing' | 'complete' | 'error'
    """
    result = review_results.get(id)
    if not result:
        # Maybe the challenge hasn't been submitted yet
        raise HTTPException(status_code=404, detail=f"No review found for Decision #{id}")
    return result


@app.get("/challenge/{id}/status")
def get_challenge_status(id: int):
    try:
        decision = blockchain_service.get_decision(id)
        current_time = int(time.time())
        expired_at = decision.get("timestamp") + settings.CHALLENGE_WINDOW_SECONDS
        time_remaining = max(0, expired_at - current_time) if decision.get("status") == 0 else 0

        return {
            "decision_id": id,
            "status": decision.get("status"),
            "status_label": decision.get("status_label"),
            "is_challengeable": decision.get("is_challengeable"),
            "time_remaining_seconds": time_remaining,
        }
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

# --- MOCK AGENT ---

class MockAgentRequest(BaseModel):
    action: str
    reason: str
    amount: int
    agent_name: str = "Test-Agent"
    explanation_hash: str = ""

@app.post("/agent/trigger")
def trigger_agent(req: MockAgentRequest):
    try:
        tx_hash = blockchain_service.log_decision(req.agent_name, req.action, req.reason, req.amount, req.explanation_hash, settings.PRIVATE_KEY)
        return {
            "success": True,
            "tx_hash": tx_hash,
            "action": req.action,
            "hela_explorer_url": f"https://testnet-blockexplorer.helachain.com/tx/{tx_hash}"
        }
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

# --- INTENT LOGGER & VERIFICATION ---

class SubmitIntentRequest(BaseModel):
    action: str
    reason: str
    amount: int

@app.post("/audit/submit-intent")
def submit_intent(req: SubmitIntentRequest):
    intent_data = {
        "action": req.action,
        "reason": req.reason,
        "amount": req.amount,
        "timestamp": int(time.time())
    }
    
    # 1. Generate Explanation & Risk Score BEFORE it hits network
    explanation_res = ai_explainer.explain_intent(intent_data)
    
    # 2. Store in memory
    audit_id = str(uuid.uuid4())
    intents_db[audit_id] = {
        "audit_id": audit_id,
        "action": req.action,
        "reason": req.reason,
        "amount": req.amount,
        "explanation": explanation_res.get("explanation"),
        "risk_score": explanation_res.get("risk_score"),
        "status": "pending",
        "tx_hash": None,
        "submitted_at": intent_data["timestamp"]
    }
    
    return intents_db[audit_id]

@app.get("/audit/pending")
def get_pending_intents():
    pending = [intent for intent in intents_db.values() if intent["status"] == "pending"]
    # Sort by newest first
    pending.sort(key=lambda x: x["submitted_at"], reverse=True)
    return {"pending_intents": pending, "total": len(pending)}

class VerifyIntentRequest(BaseModel):
    audit_id: str
    verifier_address: str = ""

@app.post("/audit/verify")
def verify_intent(req: VerifyIntentRequest):
    if req.audit_id not in intents_db:
        raise HTTPException(status_code=404, detail="Intent not found")
        
    intent = intents_db[req.audit_id]
    if intent["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Intent already {intent['status']}")
        
    try:
        # Trigger the actual execution on the HeLa blockchain!
        explanation_hash = intent.get("explanation", "")[:32] # Mock hash
        agent_name = intent.get("agent_name", "Command-Center")
        tx_hash = blockchain_service.log_decision(
            agent_name=agent_name,
            action=intent["action"],
            reason=intent["reason"],
            amount=intent["amount"],
            explanation_hash=explanation_hash,
            private_key=settings.PRIVATE_KEY
        )
        
        intent["status"] = "verified"
        intent["tx_hash"] = tx_hash
        intent["verified_by"] = req.verifier_address
        intent["verified_at"] = int(time.time())
        
        return {
            "success": True,
            "message": "Intent verified and executed on HeLa network",
            "audit_id": req.audit_id,
            "tx_hash": tx_hash,
            "hela_explorer_url": f"https://testnet-scan.helachain.com/tx/{tx_hash}"
        }
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────
#  AUTONOMOUS AGENTS ENGINE
#  4 distinct AI personas generate decisions independently.
#  Low risk (<= 5) → auto-executed on HeLa blockchain.
#  High risk (> 5) → queued in Command Center for human review.
# ─────────────────────────────────────────────────────────────

import random

AGENT_PROFILES = {
    "Alpha-Trader": {
        "description": "High-frequency DeFi trading agent focused on arbitrage and rebalancing",
        "decisions": [
            ("Swap 10 ETH to USDC", "Market volatility spike detected — reducing ETH exposure by 15% to minimize downside risk", 500),
            ("Provide liquidity to ETH/USDC pool", "Fee APY at 8.4%, pool utilization high — optimal LP window identified", 100),
            ("Purchase ETH on price dip", "RSI dropped below 28, historical buy signal confirmed across 3 timeframes", 200),
            ("Close ETH long position", "Bollinger Band upper breach detected, momentum reversal incoming", 300),
        ]
    },
    "DAO-Governor": {
        "description": "Governance agent that votes and manages treasury on behalf of DAO",
        "decisions": [
            ("Vote YES on Proposal #44", "Proposal upgrades core protocol security module — risk model fully approves", 0),
            ("Vote NO on Proposal #45", "Proposal introduces centralization risk — AI governance model rejects", 0),
            ("Transfer 50 USDC to grants committee", "Monthly DAO-approved grant disbursement per charter clause 12", 50),
            ("Delegate 1000 votes to security council", "Emergency security measure — quorum threshold at risk", 0),
        ]
    },
    "Yield-Seeker": {
        "description": "Optimizes yield by staking, compounding, and migrating liquidity",
        "decisions": [
            ("Stake 10 HELA tokens", "Staking APY at 12.4%, optimal compounding window identified", 10),
            ("Restake compounding rewards", "Auto-compound triggered at 0.5 HELA threshold — maximizes returns", 1),
            ("Withdraw from low-yield pool", "Current APY dropped to 2.1%, migrating to 8.9% pool", 25),
            ("Deposit to HELA yield vault", "Vault APY at 14.2% — highest risk-adjusted yield available", 50),
        ]
    },
    "Risk-Manager": {
        "description": "Portfolio risk management agent enforcing stop-loss and exposure limits",
        "decisions": [
            ("Withdraw LP position", "Impermanent loss exceeded 8% threshold — exiting position per risk policy", 100),
            ("Reduce ETH exposure by 20%", "Portfolio correlation risk elevated, BTC correlation at 0.94", 300),
            ("Activate emergency stop-loss", "Portfolio drawdown at 12% — exceeds 10% hard limit", 800),
            ("Rebalance portfolio to 60/40 split", "Scheduled weekly rebalancing — drift detected at 7%", 150),
        ]
    }
}

AUTO_EXECUTE_THRESHOLD = 5  # Risk score <= this → auto-execute on blockchain


async def _run_single_agent(agent_name: str, profile: dict) -> dict:
    """Run one agent asynchronously — pick decision, assess with Gemini, execute or queue."""
    import asyncio
    action, reason, amount = random.choice(profile["decisions"])

    intent_data = {
        "action": action,
        "reason": f"[{agent_name}] {reason}",
        "amount": amount
    }

    # Run the blocking Gemini call in a thread so it doesn't block the event loop
    explanation_res = await asyncio.to_thread(ai_explainer.explain_intent, intent_data)
    risk_score = explanation_res.get("risk_score", 5)
    explanation = explanation_res.get("explanation", "")

    result = {
        "agent": agent_name,
        "agent_description": profile["description"],
        "action": action,
        "reason": reason,
        "amount": amount,
        "risk_score": risk_score,
        "explanation": explanation,
    }

    if risk_score <= AUTO_EXECUTE_THRESHOLD:
        # ✅ LOW RISK → Auto-execute directly on blockchain (fire-and-forget, no receipt wait)
        try:
            explanation_hash = explanation[:32] if explanation else agent_name
            tx_hash = await asyncio.to_thread(
                blockchain_service.log_decision,
                agent_name, action, f"[{agent_name}] {reason}", amount, explanation_hash, settings.PRIVATE_KEY
            )
            result.update({
                "status": "auto_executed",
                "tx_hash": tx_hash,
                "explorer_url": f"https://testnet-scan.helachain.com/tx/{tx_hash}",
                "message": "Auto-executed on HeLa blockchain (low risk)"
            })
        except Exception as e:
            result.update({
                "status": "execution_failed",
                "tx_hash": None,
                "message": f"Blockchain error: {str(e)}"
            })
    else:
        # 🚨 HIGH RISK → Queue for human review in Command Center
        audit_id = str(uuid.uuid4())
        intents_db[audit_id] = {
            "audit_id": audit_id,
            "action": action,
            "reason": f"[{agent_name}] {reason}",
            "amount": amount,
            "agent_name": agent_name,
            "explanation": explanation,
            "risk_score": risk_score,
            "status": "pending",
            "tx_hash": None,
            "submitted_at": int(time.time())
        }
        result.update({
            "status": "pending_review",
            "audit_id": audit_id,
            "tx_hash": None,
            "message": "Queued for human review (high risk)"
        })

    print(f"[{agent_name}] Risk: {risk_score}/10 -> {result['status']}")
    return result


@app.post("/agents/run")
async def run_autonomous_agents():
    """
    Trigger all 4 autonomous agents concurrently.
    Results return as soon as all agents finish (parallel, not sequential).
    Low risk → auto-executes on HeLa. High risk → queued for human review.
    """
    import asyncio

    # Run all agents simultaneously — total time = slowest agent, not sum of all
    tasks = [_run_single_agent(name, profile) for name, profile in AGENT_PROFILES.items()]
    results = await asyncio.gather(*tasks, return_exceptions=False)

    auto_executed  = sum(1 for r in results if r["status"] == "auto_executed")
    pending_review = sum(1 for r in results if r["status"] == "pending_review")
    failed         = sum(1 for r in results if r["status"] == "execution_failed")

    return {
        "agents_run": len(results),
        "auto_executed": auto_executed,
        "pending_review": pending_review,
        "failed": failed,
        "threshold": AUTO_EXECUTE_THRESHOLD,
        "results": list(results)
    }


@app.get("/agents/profiles")
def get_agent_profiles():
    """Return the list of active agent profiles for the UI."""
    return {
        "agents": [
            {"name": name, "description": profile["description"], "decision_count": len(profile["decisions"])}
            for name, profile in AGENT_PROFILES.items()
        ],
        "auto_execute_threshold": AUTO_EXECUTE_THRESHOLD
    }

@app.get("/reputation")
def get_agent_reputations():
    reputs = {}
    for name in AGENT_PROFILES.keys():
        try:
            r = blockchain_service.contract.functions.getReputation(name).call()
            reputs[name] = r
        except Exception:
            reputs[name] = 100
    
    ls = [{"name": k, "reputation": v} for k, v in reputs.items()]
    ls.sort(key=lambda x: x["reputation"], reverse=True)
    return {"leaderboard": ls}
