"""
backend/main.py — FastAPI REST + WebSocket server for AAP.

Endpoints:
  GET  /api/decisions           - List all PDRs
  GET  /api/decisions/{id}      - Get single PDR
  POST /api/agent/analyze       - Trigger agent to analyze a symbol
  POST /api/decisions/{id}/approve - Manual approve a pending trade
  POST /api/decisions/{id}/reject  - Manual reject a pending trade
  GET  /api/verify/{id}         - Full 3-level verification
  POST /api/challenges          - Raise a challenge (off-chain record)
  GET  /api/challenges          - List all challenges
  GET  /api/stats               - Dashboard stats
  WS   /ws/feed                 - WebSocket live feed
"""

import os
import sys
import asyncio
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional, List

# FastAPI
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Internal
sys.path.insert(0, str(Path(__file__).parent.parent / "agent"))
sys.path.insert(0, str(Path(__file__).parent.parent / "protocol"))

from financial_agent import FinancialAgent
from pipeline        import AAPPipeline

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s %(message)s")

# ─── App Setup ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Agent Audit Protocol API",
    description="Transparent logging, verification, and governance of AI trading decisions",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global instances (singleton) ──────────────────────────────────────────
agent    = FinancialAgent()
pipeline = AAPPipeline()

# In-memory challenge store (replace with PostgreSQL)
_challenges: list[dict] = []

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, message: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

manager = ConnectionManager()


# ─── Pydantic Models ────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    symbol:   str = "RELIANCE"
    quantity: int = 10

class ApprovalRequest(BaseModel):
    approved_by: str = "user"
    note:        str = ""

class ChallengeRequest(BaseModel):
    decision_id:     str
    reason:          str
    evidence_note:   str = ""
    challenger_addr: str = ""


# ─── Routes ─────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    """Serve dashboard HTML."""
    dashboard = Path(__file__).parent.parent / "dashboard" / "index.html"
    if dashboard.exists():
        return FileResponse(str(dashboard))
    return {"message": "AAP Protocol API", "docs": "/api/docs"}


@app.get("/api/decisions")
async def get_decisions(
    status: Optional[str] = None,
    symbol: Optional[str] = None,
    limit:  int = 50,
):
    """List all PDRs with optional filters."""
    pdrs = pipeline.get_all_pdrs()

    if status:
        pdrs = [p for p in pdrs if p.get("execution_status") == status.upper()]
    if symbol:
        pdrs = [p for p in pdrs if p.get("asset") == symbol.upper()]

    # Return newest first, limited
    pdrs = sorted(pdrs, key=lambda p: p.get("timestamp", ""), reverse=True)[:limit]

    return {
        "count":     len(pdrs),
        "decisions": pdrs,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/api/decisions/{decision_id}")
async def get_decision(decision_id: str):
    """Get a single PDR by decision_id."""
    pdr = pipeline.get_pdr(decision_id)
    if not pdr:
        raise HTTPException(status_code=404, detail=f"Decision {decision_id} not found")
    return pdr


@app.post("/api/agent/analyze")
async def analyze(req: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Trigger the financial agent to analyze a symbol.
    Runs the full pipeline: Agent → PDR → IPFS → HeLa → Verify.
    """
    async def _run():
        try:
            pdr = agent.analyze(req.symbol, req.quantity)
            if "error" in pdr:
                return
            enriched = pipeline.process(pdr)
            await manager.broadcast({
                "type":    "NEW_DECISION",
                "payload": _safe_pdr(enriched),
            })
        except Exception as e:
            log.error(f"Analyze error: {e}")
            await manager.broadcast({"type": "ERROR", "message": str(e)})

    background_tasks.add_task(lambda: asyncio.create_task(_run()))
    return {"message": f"Analyzing {req.symbol} (qty={req.quantity})...", "status": "PROCESSING"}


@app.post("/api/decisions/{decision_id}/approve")
async def approve_decision(decision_id: str, req: ApprovalRequest):
    """Manually approve a PENDING_MANUAL_APPROVAL decision."""
    pdr = pipeline.get_pdr(decision_id)
    if not pdr:
        raise HTTPException(404, f"Decision {decision_id} not found")
    if pdr.get("execution_status") not in ("PENDING_MANUAL_APPROVAL", "pending_manual_approval"):
        raise HTTPException(400, "Decision is not pending manual approval")

    pdr["execution_status"] = "APPROVED"
    pdr["approved_by"]      = req.approved_by
    pdr["approved_at"]      = datetime.utcnow().isoformat() + "Z"
    pdr["approval_note"]    = req.note

    await manager.broadcast({"type": "DECISION_APPROVED", "decision_id": decision_id})
    return {"decision_id": decision_id, "status": "APPROVED"}


@app.post("/api/decisions/{decision_id}/reject")
async def reject_decision(decision_id: str, req: ApprovalRequest):
    """Manually reject a pending decision."""
    pdr = pipeline.get_pdr(decision_id)
    if not pdr:
        raise HTTPException(404, f"Decision {decision_id} not found")

    pdr["execution_status"] = "REJECTED"
    pdr["rejected_by"]      = req.approved_by
    pdr["rejected_at"]      = datetime.utcnow().isoformat() + "Z"
    pdr["rejection_note"]   = req.note

    await manager.broadcast({"type": "DECISION_REJECTED", "decision_id": decision_id})
    return {"decision_id": decision_id, "status": "REJECTED"}


@app.get("/api/verify/{decision_id}")
async def verify_decision(decision_id: str, level: int = 1):
    """Run verification on a stored PDR. level=1,2,3"""
    if level == 1:
        pdr = pipeline.get_pdr(decision_id)
        if not pdr:
            raise HTTPException(404, "Not found")
        from verification.level1_hash import verify_pdr_integrity
        return verify_pdr_integrity(pdr)
    else:
        return pipeline.verify_full(decision_id)


@app.post("/api/challenges")
async def raise_challenge(req: ChallengeRequest):
    """Record a challenge against a decision (off-chain record + triggers on-chain later)."""
    # Check decision exists
    pdr = pipeline.get_pdr(req.decision_id)
    if not pdr:
        raise HTTPException(404, f"Decision {req.decision_id} not found")

    challenge = {
        "challenge_id":   f"ch_{req.decision_id}_{len(_challenges):04d}",
        "decision_id":    req.decision_id,
        "reason":         req.reason,
        "evidence_note":  req.evidence_note,
        "challenger_addr":req.challenger_addr,
        "status":         "OPEN",
        "votes_for":      0,
        "votes_against":  0,
        "raised_at":      datetime.utcnow().isoformat() + "Z",
        "voting_ends_at": None,
        "asset":          pdr.get("asset"),
        "action":         pdr.get("action"),
        "decision_id_ref":req.decision_id,
    }
    _challenges.append(challenge)

    # Update PDR status
    pdr["execution_status"] = "CHALLENGED"

    await manager.broadcast({"type": "CHALLENGE_RAISED", "payload": challenge})
    return challenge


@app.post("/api/challenges/{challenge_id}/vote")
async def vote_challenge(challenge_id: str, support: bool, voter: str = "anonymous"):
    """Vote on an open challenge."""
    ch = next((c for c in _challenges if c["challenge_id"] == challenge_id), None)
    if not ch:
        raise HTTPException(404, "Challenge not found")
    if ch["status"] != "OPEN":
        raise HTTPException(400, "Challenge is not open for voting")

    if support:
        ch["votes_for"] += 1
    else:
        ch["votes_against"] += 1

    await manager.broadcast({"type": "VOTE_CAST", "challenge_id": challenge_id,
                             "support": support, "voter": voter})
    return {"challenge_id": challenge_id, "votes_for": ch["votes_for"], "votes_against": ch["votes_against"]}


@app.get("/api/challenges")
async def get_challenges(status: Optional[str] = None):
    """List all challenges."""
    chs = _challenges
    if status:
        chs = [c for c in chs if c["status"] == status.upper()]
    return {"count": len(chs), "challenges": chs}


@app.get("/api/stats")
async def get_stats():
    """Dashboard summary statistics."""
    pdrs       = pipeline.get_all_pdrs()
    challenges = _challenges

    by_status  = {}
    by_action  = {}
    by_symbol  = {}

    for p in pdrs:
        s = p.get("execution_status", "unknown")
        a = p.get("action", "unknown")
        sym = p.get("asset", "unknown")
        by_status[s]   = by_status.get(s, 0) + 1
        by_action[a]   = by_action.get(a, 0) + 1
        by_symbol[sym] = by_symbol.get(sym, 0) + 1

    avg_conf = sum(p.get("confidence_score", 0) for p in pdrs) / len(pdrs) if pdrs else 0
    avg_risk = sum(p.get("risk_score_numeric", 0) for p in pdrs) / len(pdrs) if pdrs else 0

    return {
        "total_decisions":   len(pdrs),
        "total_challenges":  len(challenges),
        "by_status":         by_status,
        "by_action":         by_action,
        "by_symbol":         by_symbol,
        "avg_confidence":    round(avg_conf, 3),
        "avg_risk_score":    round(avg_risk, 3),
        "pending_manual":    by_status.get("PENDING_MANUAL_APPROVAL", 0),
        "open_challenges":   len([c for c in challenges if c["status"] == "OPEN"]),
        "timestamp":         datetime.utcnow().isoformat() + "Z",
    }


@app.websocket("/ws/feed")
async def websocket_feed(ws: WebSocket):
    """Real-time feed of all AAP events."""
    await manager.connect(ws)
    try:
        await ws.send_json({"type": "CONNECTED", "message": "AAP Live Feed connected"})
        while True:
            await ws.receive_text()  # Keep alive
    except WebSocketDisconnect:
        manager.disconnect(ws)


@app.post("/api/flush")
async def flush_batch():
    """Force-flush the pending Merkle batch to HeLa (e.g., end of day)."""
    result = pipeline.flush_batch()
    return result or {"message": "No pending decisions to flush"}


def _safe_pdr(pdr: dict) -> dict:
    """Remove very large fields for WebSocket broadcast."""
    compact = {k: v for k, v in pdr.items() if k not in ("merkle_info",)}
    if "reasoning_chain" in compact and len(compact["reasoning_chain"]) > 4:
        compact["reasoning_chain"] = compact["reasoning_chain"][:4]
    return compact


# ─── Run ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("BACKEND_HOST", "0.0.0.0"),
        port=int(os.getenv("BACKEND_PORT", "8000")),
        reload=True,
        log_level="info",
    )
