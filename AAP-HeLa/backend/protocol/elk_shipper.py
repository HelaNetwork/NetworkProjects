"""AAP — ELK Shipper: ships PDR events to Elasticsearch (with simulation fallback)."""
from __future__ import annotations
import os, json, time, logging, threading
from typing import Any
from queue import Queue, Empty

logger = logging.getLogger(__name__)

ES_URL    = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
INDEX_PFX = os.getenv("ELK_INDEX_PREFIX", "aap")


class ELKShipper:
    """
    Ships events to Elasticsearch asynchronously.
    Falls back to local JSONL file logging when ES is not available.
    """

    def __init__(self):
        self._queue:  Queue  = Queue(maxsize=1000)
        self._enabled = False
        self._fallback_log = os.path.join(
            os.path.dirname(__file__), "..", "data", "elk_fallback.jsonl"
        )
        os.makedirs(os.path.dirname(self._fallback_log), exist_ok=True)
        self._try_connect()
        # Start async worker
        t = threading.Thread(target=self._worker, daemon=True)
        t.start()

    def _try_connect(self):
        try:
            from elasticsearch import Elasticsearch
            self._es = Elasticsearch(ES_URL, request_timeout=2)
            info = self._es.info()
            self._enabled = True
            logger.info(f"[ELK] Connected to Elasticsearch: {ES_URL}")
        except Exception as e:
            logger.warning(f"[ELK] Elasticsearch not available ({e}). Using JSONL fallback.")
            self._enabled = False

    # ── Public API ────────────────────────────────────────────────────────
    def ship_pdr(self, pdr: dict):
        doc = {
            "index":       f"{INDEX_PFX}_decisions",
            "decision_id": pdr.get("decision_id"),
            "asset":       pdr.get("asset"),
            "action":      pdr.get("action"),
            "risk_score":  pdr.get("risk_score_numeric", 0),
            "confidence":  pdr.get("confidence_score", 0),
            "agent_model": pdr.get("model_info", {}).get("llm", "unknown"),
            "approval":    pdr.get("approval_type"),
            "status":      pdr.get("execution_status"),
            "ipfs_cid":    pdr.get("ipfs_cid"),
            "timestamp":   pdr.get("timestamp") or _now_iso(),
        }
        self._enqueue(doc)

    def ship_chat_event(self, event: dict):
        doc = {"index": f"{INDEX_PFX}_chat_sessions", **event, "timestamp": _now_iso()}
        self._enqueue(doc)

    def ship_api_log(self, method: str, path: str, status: int, duration_ms: float):
        doc = {
            "index":       f"{INDEX_PFX}_api_logs",
            "method":      method,
            "path":        path,
            "status":      status,
            "duration_ms": duration_ms,
            "timestamp":   _now_iso(),
        }
        self._enqueue(doc)

    # ── Internals ─────────────────────────────────────────────────────────
    def _enqueue(self, doc: dict):
        try:
            self._queue.put_nowait(doc)
        except Exception:
            pass  # drop if full

    def _worker(self):
        while True:
            try:
                doc = self._queue.get(timeout=2)
                self._send(doc)
            except Empty:
                continue

    def _send(self, doc: dict):
        index = doc.pop("index", f"{INDEX_PFX}_events")
        if self._enabled:
            try:
                self._es.index(index=index, body=doc)
                return
            except Exception as e:
                logger.debug(f"[ELK] ES send failed: {e}")
        # Fallback: write to JSONL
        try:
            with open(self._fallback_log, "a", encoding="utf-8") as f:
                f.write(json.dumps({"_index": index, **doc}) + "\n")
        except Exception:
            pass


def _now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
