# AAEP — Autonomous Agent Execution Protocol v1.0

## Overview
AAEP is a standardized protocol for deploying, communicating between, and auditing
autonomous onchain agents. Any system (GasSafe, DeFi treasurer, governance bot, etc.)
can implement AAEP to gain built-in explainability, auditability, and inter-agent trust.

---

## 1. Agent Identity

Every agent must declare a manifest at startup:

```json
{
  "agent_id": "string (unique, kebab-case)",
  "agent_type": "BOOKING | SCORING | GOVERNANCE | EXECUTION | MONITOR",
  "version": "semver string",
  "capabilities": ["array of action strings"],
  "permissions": ["ONCHAIN_WRITE | ONCHAIN_READ | SCORE | VERIFY | RELEASE"],
  "owner": "ethereum address"
}
```

---

## 2. Inter-Agent Message Format (IAMF)

All agent-to-agent communication MUST use this envelope:

```json
{
  "aaep_version": "1.0",
  "message_id": "uuid-v4",
  "trace_id": "uuid-v4 (shared across a full workflow)",
  "timestamp": "ISO-8601",
  "from": "agent_id",
  "to": "agent_id",
  "intent": "INTENT_CONSTANT",
  "priority": "LOW | NORMAL | HIGH | CRITICAL",
  "payload": {},
  "requires_response": true,
  "timeout_ms": 5000
}
```

### Defined Intents
| Intent | Direction | Description |
|--------|-----------|-------------|
| `SCORE_REQUEST` | Booking → Scoring | Request fraud score for a booking |
| `SCORE_RESPONSE` | Scoring → Booking | Return score + explanation |
| `LOCK_SUBSIDY` | Booking → Chain | Lock escrow onchain |
| `RELEASE_SUBSIDY` | Booking → Chain | Release escrow onchain |
| `OVERRIDE_DECISION` | Admin → Any | Human override of agent decision |
| `AUDIT_REQUEST` | Admin → Any | Request full decision trace |
| `AUDIT_RESPONSE` | Any → Admin | Return structured audit trail |

---

## 3. Decision Log Entry (DLE)

Every decision an agent makes MUST produce a DLE written to the audit log:

```json
{
  "dle_id": "uuid-v4",
  "trace_id": "uuid-v4",
  "agent_id": "string",
  "timestamp": "ISO-8601",
  "decision_type": "string",
  "inputs": {},
  "reasoning": {
    "factors": [
      { "name": "string", "value": "any", "weight": "number", "contribution": "number" }
    ],
    "summary": "human-readable string explaining the decision"
  },
  "output": {},
  "confidence": "0.0–1.0",
  "onchain_tx": "tx_hash or null",
  "overrideable": true,
  "override_history": []
}
```

---

## 4. Override Mechanism

Any DLE with `overrideable: true` can be challenged:

```json
{
  "override_id": "uuid-v4",
  "dle_id": "reference",
  "challenged_by": "admin_address or DAO",
  "reason": "string",
  "new_output": {},
  "timestamp": "ISO-8601"
}
```

Override is appended to `override_history` in the original DLE. Onchain actions
triggered by the original decision are reversed via the smart contract's `overrideBooking` function.

---

## 5. Agent Lifecycle States

```
IDLE → PROCESSING → WAITING_FOR_PEER → DECIDING → EXECUTING → COMPLETE
                                                              ↘ FAILED
                                                              ↘ OVERRIDDEN
```

---

## 6. Audit Trail Guarantee

- Every DLE is written to a local append-only JSON store (or IPFS in production)
- A Merkle root of all DLEs is committed onchain every N decisions (configurable)
- Anyone can verify a DLE has not been tampered with by recomputing the Merkle path

---

## 7. Implementing AAEP in a New System

1. Define your agents and their manifests
2. Use IAMF for all agent communication — no direct function calls between agents
3. Every conditional branch in agent logic MUST emit a DLE
4. Expose a `GET /audit/:trace_id` endpoint returning the full DLE chain
5. Expose a `POST /override/:dle_id` endpoint for human intervention
6. Commit Merkle roots onchain periodically

---

## 8. GasSafe Implementation

| AAEP Concept | GasSafe Implementation |
|---|---|
| Agent 1 | `booking-agent` — ZKP, SBT, Escrow |
| Agent 2 | `scoring-agent` — DBSCAN, Isolation Forest |
| IAMF | Internal HTTP calls with full envelope |
| DLE Store | `/data/audit_log.json` (append-only) |
| Onchain Merkle | `AuditAnchor.sol` on Holesky |
| Override | Admin UI → `POST /override/:dle_id` |
