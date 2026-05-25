// auditLogger.js — AAEP Decision Log Entry store
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const LOG_PATH = path.join(__dirname, "../data/audit_log.json");
const DB_PATH = path.join(__dirname, "../data/db.json");

function ensureFiles() {
  fs.mkdirSync(path.join(__dirname, "../data"), { recursive: true });
  if (!fs.existsSync(LOG_PATH)) fs.writeFileSync(LOG_PATH, JSON.stringify([], null, 2));
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ users: {}, bookings: {}, deliveries: {} }, null, 2));
}

// ── DB helpers ────────────────────────────────────────────────
function readDB() {
  ensureFiles();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Audit Log ─────────────────────────────────────────────────
function readLog() {
  ensureFiles();
  return JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
}

function writeDLE(dle) {
  const log = readLog();
  log.push(dle);
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
  return dle;
}

function logDecision({
  agentId, traceId, decisionType, inputs, reasoning, output,
  confidence = 1.0, onchainTx = null, overrideable = true
}) {
  const dle = {
    dle_id: uuidv4(),
    trace_id: traceId,
    agent_id: agentId,
    timestamp: new Date().toISOString(),
    decision_type: decisionType,
    inputs,
    reasoning,
    output,
    confidence,
    onchain_tx: onchainTx,
    overrideable,
    override_history: [],
    hash: null
  };

  // Self-hash for tamper detection
  const { hash: _, ...withoutHash } = dle;
  dle.hash = crypto.createHash("sha256").update(JSON.stringify(withoutHash)).digest("hex");

  return writeDLE(dle);
}

function getByTraceId(traceId) {
  return readLog().filter(d => d.trace_id === traceId);
}

function getAll() {
  return readLog();
}

function overrideDLE(dleId, challengedBy, reason, newOutput) {
  const log = readLog();
  const idx = log.findIndex(d => d.dle_id === dleId);
  if (idx === -1) return null;

  const override = {
    override_id: uuidv4(),
    challenged_by: challengedBy,
    reason,
    original_output: { ...log[idx].output },  // ← SNAPSHOT before overwrite
    new_output: newOutput,
    timestamp: new Date().toISOString()
  };

  log[idx].override_history.push(override);
  if (newOutput) log[idx].output = { ...log[idx].output, ...newOutput, overridden: true };
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
  return log[idx];
}

// Compute simple Merkle root of all DLE hashes
function computeMerkleRoot() {
  const log = readLog();
  if (log.length === 0) return "0x0";
  let hashes = log.map(d => d.hash || "");
  while (hashes.length > 1) {
    const next = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left;
      next.push(crypto.createHash("sha256").update(left + right).digest("hex"));
    }
    hashes = next;
  }
  return hashes[0];
}

module.exports = { logDecision, getByTraceId, getAll, overrideDLE, computeMerkleRoot, readDB, writeDB };
