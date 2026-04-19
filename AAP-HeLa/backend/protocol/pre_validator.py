"""
pre_validator.py — Gate-check BEFORE a trade executes.
Checks all DAO policy rules. Blocks or flags trades that violate them.
"""

import os
import json
import logging
from dataclasses import dataclass, field
from typing import Optional

log = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    passed:        bool
    violations:    list[dict]  = field(default_factory=list)
    warnings:      list[dict]  = field(default_factory=list)
    rules_checked: list[str]   = field(default_factory=list)
    override_type: str         = "AUTO"   # AUTO / MANUAL / BLOCKED


# Default policy values (used when PolicyRegistry.sol is unreachable)
DEFAULT_POLICIES = {
    "AUTO_APPROVE_LIMIT_INR":     "10000",
    "RISK_SCORE_AUTO_THRESHOLD":  "0.5",
    "ALLOWED_ASSETS":             "RELIANCE,TCS,HDFC,INFY,WIPRO,BHARTIARTL,ICICIBANK,KOTAKBANK",
    "MAX_TRADES_PER_HOUR":        "10",
    "CHALLENGE_WINDOW_HOURS":     "24",
}


class PreValidator:
    """
    Runs all policy checks BEFORE a PDR is accepted for execution.
    Called after the agent makes a decision, before IPFS upload.
    """

    def __init__(self, policy_registry=None):
        """
        policy_registry: optional HeLaAnchor-connected PolicyRegistry
        Falls back to DEFAULT_POLICIES if not available
        """
        self._policy_registry = policy_registry
        self._trade_count_window: list[float] = []  # timestamps of recent trades

    def _get_policies(self) -> dict:
        """Fetch active policies from chain or fall back to defaults."""
        if self._policy_registry is None:
            return DEFAULT_POLICIES.copy()
        try:
            # In live mode, call PolicyRegistry.sol
            # keys, values = self._policy_registry.functions.getAllActiveRules().call()
            # return dict(zip(keys, values))
            return DEFAULT_POLICIES.copy()
        except Exception:
            return DEFAULT_POLICIES.copy()

    def validate(self, pdr: dict) -> ValidationResult:
        """
        Run all checks on a PDR before execution.
        Returns ValidationResult with pass/fail + violation details.
        """
        policies = self._get_policies()
        violations = []
        warnings   = []
        checked    = []

        action      = pdr.get("action",          "HOLD")
        asset       = pdr.get("asset",           "")
        trade_value = float(pdr.get("trade_value_inr", 0))
        risk_score  = float(pdr.get("risk_score_numeric", 0.0))
        confidence  = float(pdr.get("confidence_score",  0.5))

        # ── Rule 1: Asset Allowlist ────────────────────────────────────────
        allowed = [s.strip() for s in policies["ALLOWED_ASSETS"].split(",")]
        checked.append("ALLOWED_ASSETS")
        if asset not in allowed:
            violations.append({
                "rule":    "ALLOWED_ASSETS",
                "message": f"{asset} is not in the approved trading list",
                "value":   asset,
                "limit":   policies["ALLOWED_ASSETS"],
                "severity":"HIGH",
            })

        # ── Rule 2: Auto-Approve Threshold ────────────────────────────────
        auto_limit = float(policies["AUTO_APPROVE_LIMIT_INR"])
        checked.append("AUTO_APPROVE_LIMIT_INR")
        if trade_value > auto_limit * 10:  # 10x limit = block
            violations.append({
                "rule":    "TRADE_VALUE_TOO_HIGH",
                "message": f"Trade value ₹{trade_value:,.0f} exceeds safety limit",
                "value":   trade_value,
                "limit":   auto_limit * 10,
                "severity":"HIGH",
            })

        # ── Rule 3: Risk Score ─────────────────────────────────────────────
        risk_threshold = float(policies["RISK_SCORE_AUTO_THRESHOLD"])
        checked.append("RISK_SCORE_AUTO_THRESHOLD")
        if risk_score > 0.80:
            violations.append({
                "rule":    "RISK_SCORE_EXTREME",
                "message": f"Risk score {risk_score:.2f} exceeds extreme threshold 0.80",
                "value":   risk_score,
                "limit":   0.80,
                "severity":"EXTREME",
            })
        elif risk_score > risk_threshold:
            warnings.append({
                "rule":    "RISK_SCORE_ELEVATED",
                "message": f"Risk score {risk_score:.2f} requires manual approval",
                "value":   risk_score,
                "limit":   risk_threshold,
                "severity":"MEDIUM",
            })

        # ── Rule 4: Minimum Confidence ────────────────────────────────────
        checked.append("MIN_CONFIDENCE")
        if confidence < 0.40:
            violations.append({
                "rule":    "LOW_CONFIDENCE",
                "message": f"Agent confidence {confidence:.2f} below minimum 0.40",
                "value":   confidence,
                "limit":   0.40,
                "severity":"HIGH",
            })
        elif confidence < 0.60:
            warnings.append({
                "rule":    "MODERATE_CONFIDENCE",
                "message": f"Agent confidence {confidence:.2f} is moderate — consider manual review",
                "value":   confidence,
                "limit":   0.60,
                "severity":"LOW",
            })

        # ── Rule 5: Rate Limiting ─────────────────────────────────────────
        import time
        now         = time.time()
        hour_ago    = now - 3600
        max_per_hr  = int(policies["MAX_TRADES_PER_HOUR"])
        self._trade_count_window = [t for t in self._trade_count_window if t > hour_ago]
        checked.append("MAX_TRADES_PER_HOUR")
        if len(self._trade_count_window) >= max_per_hr:
            violations.append({
                "rule":    "RATE_LIMIT_EXCEEDED",
                "message": f"Rate limit: {len(self._trade_count_window)} trades in last hour (max={max_per_hr})",
                "value":   len(self._trade_count_window),
                "limit":   max_per_hr,
                "severity":"HIGH",
            })
        else:
            self._trade_count_window.append(now)

        # ── Rule 6: Hardcoded — No HOLD submissions ─────────────────────
        checked.append("ACTION_VALIDITY")
        if action not in ("BUY", "SELL", "HOLD"):
            violations.append({
                "rule":    "INVALID_ACTION",
                "message": f"Invalid action: {action}",
                "severity":"EXTREME",
            })

        # ── Determine override type ────────────────────────────────────────
        extreme = [v for v in violations if v["severity"] in ("HIGH", "EXTREME")]
        if extreme:
            override_type = "BLOCKED"
        elif warnings or trade_value > auto_limit or risk_score > risk_threshold:
            override_type = "MANUAL"
        else:
            override_type = "AUTO"

        passed = len(extreme) == 0

        result = ValidationResult(
            passed=        passed,
            violations=    violations,
            warnings=      warnings,
            rules_checked= checked,
            override_type= override_type,
        )

        if not passed:
            log.warning(f"Pre-validation FAILED for {pdr.get('decision_id')}: {[v['rule'] for v in violations]}")
        else:
            log.info(f"Pre-validation PASSED for {pdr.get('decision_id')} — type={override_type}")

        return result


class PostAuditor:
    """
    Post-execution audit: compare actual trade outcome vs PDR expected.
    Records compliance result back to the PDR.
    """

    def audit(self, pdr: dict, actual_fill_price: float, actual_qty: int) -> dict:
        """Compare actual execution vs PDR expectations."""
        expected_price = pdr.get("price_at_decision", 0)
        expected_qty   = pdr.get("quantity", 0)

        price_slippage = abs(actual_fill_price - expected_price) / expected_price * 100 if expected_price > 0 else 0
        qty_match      = actual_qty == expected_qty

        compliance = {
            "decision_id":      pdr.get("decision_id"),
            "expected_price":   expected_price,
            "actual_price":     actual_fill_price,
            "price_slippage_pct": round(price_slippage, 3),
            "expected_qty":     expected_qty,
            "actual_qty":       actual_qty,
            "qty_match":        qty_match,
            "slippage_ok":      price_slippage < 1.0,  # < 1% slippage acceptable
            "compliant":        qty_match and price_slippage < 1.0,
            "audited_at":       __import__("datetime").datetime.utcnow().isoformat() + "Z",
        }

        log.info(f"Post-audit: {pdr.get('decision_id')} — compliant={compliance['compliant']}, slippage={price_slippage:.2f}%")
        return compliance
