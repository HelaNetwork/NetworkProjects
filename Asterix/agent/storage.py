"""
storage.py — persists AgentOutput to SQLite and JSON files.
- Every scan → DB row
- Crisis scans (score >= 70) → also written to crisis_alerts/ as JSON
"""

import sqlite3
import json
import os
from datetime import datetime
from models import AgentOutput

AGENT_DIR = os.path.dirname(__file__)
DB_PATH = os.environ.get("CRISIS_DB_PATH", os.path.join(AGENT_DIR, "crisis_agent.db"))
ALERTS_DIR = os.environ.get("CRISIS_ALERTS_DIR", os.path.join(AGENT_DIR, "crisis_alerts"))


# ── SQLite ─────────────────────────────────────────────────────────────────────

def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    _ensure_schema(conn)
    return conn


def _ensure_schema(conn: sqlite3.Connection):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker           TEXT NOT NULL,
            company_name     TEXT,
            scan_timestamp   TEXT NOT NULL,
            crisis_score     INTEGER NOT NULL,
            technical_risk   INTEGER NOT NULL,
            sentiment_risk   INTEGER NOT NULL,
            combined_risk    INTEGER NOT NULL,
            status           TEXT NOT NULL,
            alert_triggered  INTEGER NOT NULL,
            recommended_action TEXT NOT NULL,
            crisis_rationale TEXT,
            full_output      TEXT NOT NULL       -- full JSON blob
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_scans_ticker ON scans(ticker)
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_scans_alert ON scans(alert_triggered)
    """)
    conn.commit()


def save_to_db(output: AgentOutput):
    conn = _get_conn()
    conn.execute("""
        INSERT INTO scans
          (ticker, company_name, scan_timestamp, crisis_score,
           technical_risk, sentiment_risk, combined_risk,
           status, alert_triggered, recommended_action,
           crisis_rationale, full_output)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        output.ticker,
        output.company_name,
        output.scan_timestamp,
        output.scores.crisis_score,
        output.scores.chart_score,
        output.scores.news_score,
        output.scores.combined_score,
        output.status,
        int(output.alert_triggered),
        output.recommended_action,
        output.crisis_rationale,
        json.dumps(output.model_dump()),
    ))
    conn.commit()
    conn.close()


def get_history(ticker: str, limit: int = 20) -> list[dict]:
    """Fetch last N scans for a ticker — useful for trend analysis by other agents."""
    conn = _get_conn()
    rows = conn.execute(
        "SELECT full_output FROM scans WHERE ticker=? ORDER BY id DESC LIMIT ?",
        (ticker, limit)
    ).fetchall()
    conn.close()
    return [json.loads(r["full_output"]) for r in rows]


def get_all_alerts() -> list[dict]:
    """Return every scan that triggered a crisis alert."""
    conn = _get_conn()
    rows = conn.execute(
        "SELECT full_output FROM scans WHERE alert_triggered=1 ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [json.loads(r["full_output"]) for r in rows]


# ── JSON file ──────────────────────────────────────────────────────────────────

def save_to_file(output: AgentOutput):
    """Write crisis alerts as individual JSON files for easy agent pickup."""
    os.makedirs(ALERTS_DIR, exist_ok=True)
    ts = output.scan_timestamp.replace(":", "-").replace("+", "").split(".")[0]
    filename = f"{ALERTS_DIR}/{output.ticker}_{ts}_score{output.crisis_score}.json"
    with open(filename, "w") as f:
        json.dump(output.model_dump(), f, indent=2)
    print(f"[CRISIS ALERT] Written to {filename}", flush=True)
