"""AAP — User Manager: reputation scoring backed by SQLite."""
from __future__ import annotations
import sqlite3, os, time, logging, contextlib

logger = logging.getLogger(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "users.db")


class UserManager:
    """Manages user reputation scores and risk profiles."""

    def __init__(self, db_path: str = DB_PATH):
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self._db = db_path
        self._init_db()

    # ── Schema ──────────────────────────────────────────────────────────
    def _init_db(self):
        with self._conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    address      TEXT PRIMARY KEY,
                    reputation   INTEGER DEFAULT 25,
                    risk_score   REAL    DEFAULT 0.5,
                    total_votes  INTEGER DEFAULT 0,
                    upheld       INTEGER DEFAULT 0,
                    dismissed    INTEGER DEFAULT 0,
                    dao_votes    INTEGER DEFAULT 0,
                    created_at   REAL,
                    updated_at   REAL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS reputation_events (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    address     TEXT,
                    event_type  TEXT,
                    delta       INTEGER,
                    reason      TEXT,
                    ts          REAL
                )
            """)

    @contextlib.contextmanager
    def _conn(self):
        conn = sqlite3.connect(self._db)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    # ── Public API ───────────────────────────────────────────────────────
    def get_or_create(self, address: str) -> dict:
        with self._conn() as conn:
            row = conn.execute("SELECT * FROM users WHERE address=?", (address,)).fetchone()
            if not row:
                now = time.time()
                conn.execute(
                    "INSERT INTO users (address, created_at, updated_at) VALUES (?,?,?)",
                    (address, now, now)
                )
                return {"address": address, "reputation": 25, "risk_score": 0.5,
                        "total_votes": 0, "upheld": 0, "dismissed": 0, "dao_votes": 0}
            return dict(row)

    def get_reputation(self, address: str) -> int:
        return self.get_or_create(address)["reputation"]

    def get_risk_score(self, address: str) -> float:
        return self.get_or_create(address)["risk_score"]

    def record_challenge_upheld(self, address: str):
        self._update_rep(address, +10, "challenge_upheld",
                         extra={"upheld": "+1", "total_votes": "+1"})

    def record_challenge_dismissed(self, address: str):
        self._update_rep(address, -5, "challenge_dismissed",
                         extra={"dismissed": "+1", "total_votes": "+1"})

    def record_dao_vote(self, address: str):
        self._update_rep(address, +3, "dao_vote", extra={"dao_votes": "+1"})

    def update_risk_score(self, address: str, risk_score: float):
        risk_score = max(0.0, min(1.0, risk_score))
        with self._conn() as conn:
            conn.execute(
                "UPDATE users SET risk_score=?, updated_at=? WHERE address=?",
                (risk_score, time.time(), address)
            )

    def get_profile(self, address: str) -> dict:
        u = self.get_or_create(address)
        from agent.multi_agent_orchestrator import AgentOrchestrator
        orch = AgentOrchestrator()
        agents = orch.get_available_agents(u["reputation"], u["risk_score"])
        return {
            **u,
            "available_agents": agents,
            "rep_tier": self._rep_tier(u["reputation"]),
        }

    # ── Internals ────────────────────────────────────────────────────────
    def _rep_tier(self, rep: int) -> str:
        if rep >= 70: return "Elite"
        if rep >= 40: return "Advanced"
        if rep >= 10: return "Standard"
        return "Beginner"

    def _update_rep(self, address: str, delta: int, event: str, extra: dict = None):
        self.get_or_create(address)
        now = time.time()
        with self._conn() as conn:
            conn.execute(
                "UPDATE users SET reputation=MIN(100,MAX(0,reputation+?)), updated_at=? WHERE address=?",
                (delta, now, address)
            )
            conn.execute(
                "INSERT INTO reputation_events (address, event_type, delta, reason, ts) VALUES (?,?,?,?,?)",
                (address, event, delta, event, now)
            )
