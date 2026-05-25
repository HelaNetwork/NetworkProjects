// bookingAgent.js — AAEP Agent 1: Autonomous Booking + Onchain
// LLM: meta-llama/Llama-3.1-8B-Instruct via Novita (HuggingFace Router)

const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { logDecision, readDB, writeDB } = require("./auditLogger");
const { handleScoreRequest } = require("./scoringAgent");
const chain = require("./chainService");
const OpenAI = require("openai");

const AGENT_ID = "booking-agent";

// ── Novita LLM Client ─────────────────────────────────────────
const llmClient = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

const LLM_MODEL = "meta-llama/Llama-3.1-8B-Instruct:novita";

// ── OTP Generator ────────────────────────────────────────────
function generateOTP() {
  // Cryptographically secure 6-digit OTP (000000–999999)
  const otp = (crypto.randomInt(0, 1000000)).toString().padStart(6, "0");
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  return { otp, otpHash };
}

// ── Mock ZKP ──────────────────────────────────────────────────
function generateMockZKP(aadhaarNumber, addressHash) {
  const salt = crypto.randomBytes(16).toString("hex");
  const commitment = crypto.createHash("sha256")
    .update(aadhaarNumber + salt + addressHash)
    .digest("hex");
  return { commitment, salt, proof: "MOCK_ZKP_PROOF_" + commitment.slice(0, 16), verified: true, mock: true };
}

function hashAddress(lat, lon, pincode) {
  return crypto.createHash("sha256").update(`${lat}_${lon}_${pincode}`).digest("hex");
}

function buildMessage(from, to, intent, payload, traceId) {
  return {
    aaep_version: "1.0",
    message_id: uuidv4(),
    trace_id: traceId,
    timestamp: new Date().toISOString(),
    from, to, intent,
    priority: "NORMAL",
    payload,
    requires_response: true,
    timeout_ms: 5000
  };
}

// ── LLM: Autonomous Registration Decision ─────────────────────
async function getLLMRegistrationDecision({ name, walletAddress, lat, lon, pincode, phone, isDuplicate, duplicateReason }) {
  const prompt = `You are an autonomous booking agent for GasSafe, a subsidized LPG gas system in India.

A new user is trying to register. Make an AUTONOMOUS DECISION.

=== REGISTRATION REQUEST ===
Name: ${name}
Wallet: ${walletAddress}
Location: ${lat}, ${lon} (Pincode: ${pincode})
Phone: ${phone}
Duplicate wallet: ${isDuplicate ? "YES - " + duplicateReason : "NO"}
Duplicate address: ${duplicateReason === "DUPLICATE_ADDRESS" ? "YES" : "NO"}

=== TASK ===
Decide whether to APPROVE or REJECT this registration.
Consider: Is this a legitimate new user? Could this be a fraudulent multi-connection attempt?
Respond ONLY with this JSON:
{
  "decision": "APPROVE|REJECT",
  "reason": "one sentence explanation",
  "confidence": 0.0,
  "flags": []
}`;

  try {
    const response = await llmClient.chat.completions.create({
      model: LLM_MODEL,
      max_tokens: 200,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }]
    });
    const raw = response.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in LLM response");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("[bookingAgent] LLM registration decision failed:", err.message);
    return {
      decision: isDuplicate ? "REJECT" : "APPROVE",
      reason: `Fallback rule: ${isDuplicate ? "duplicate detected" : "new unique registration"}`,
      confidence: 0.75,
      flags: [],
      llm_fallback: true
    };
  }
}

// ── LLM: Autonomous Booking Decision ─────────────────────────
async function getLLMBookingDecision({ bookingId, walletAddress, user, scorePayload }) {
  const {
    fraud_score, risk_label, verification_required,
    autonomous_action: scoringAgentAction, action_reason,
    primary_signal, false_positive_risk, recommended_human_review,
    llm_reasoning
  } = scorePayload;

  const prompt = `You are an autonomous booking agent for GasSafe, coordinating with the scoring agent.

The scoring agent already analyzed booking ${bookingId} and made a recommendation.
Your job is to make the FINAL AUTONOMOUS BOOKING DECISION.

=== USER CONTEXT ===
Wallet: ${walletAddress}
Vouchers remaining: ${user.vouchersRemaining}
Current risk tier: ${user.riskTier} | Registered: ${user.registeredAt}

=== SCORING AGENT RESULT ===
Fraud Score: ${fraud_score}/100
Risk Label: ${risk_label}
Verification Required: ${verification_required}
Scoring Agent Action: ${scoringAgentAction}
Primary Signal: ${primary_signal}
False Positive Risk: ${false_positive_risk}
Human Review Recommended: ${recommended_human_review}
Scoring Agent Reasoning: ${llm_reasoning}

=== YOUR TASK ===
As booking agent, make the FINAL decision: should this booking PROCEED, be HELD, or be REJECTED?
- PROCEED: approve booking, lock subsidy on-chain
- HOLD: flag for human review before proceeding
- REJECT: deny booking entirely
Respond ONLY with this JSON:
{
  "final_decision": "PROCEED|HOLD|REJECT",
  "decision_reason": "2 sentence explanation",
  "override_scoring_agent": false,
  "override_reason": null,
  "confidence": 0.0,
  "priority": "NORMAL|HIGH|CRITICAL"
}`;

  try {
    const response = await llmClient.chat.completions.create({
      model: LLM_MODEL,
      max_tokens: 300,
      temperature: 0.15,
      messages: [{ role: "user", content: prompt }]
    });
    const raw = response.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in LLM response");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("[bookingAgent] LLM booking decision failed:", err.message);
    // Fallback: trust scoring agent
    const fallbackDecision = scoringAgentAction === "APPROVE" ? "PROCEED"
      : scoringAgentAction === "ESCALATE" ? "HOLD" : "HOLD";
    return {
      final_decision: fallbackDecision,
      decision_reason: `Fallback: deferring to scoring agent recommendation (${scoringAgentAction}). LLM unavailable.`,
      override_scoring_agent: false,
      override_reason: null,
      confidence: 0.7,
      priority: fraud_score > 75 ? "HIGH" : "NORMAL",
      llm_fallback: true
    };
  }
}

// ── LLM: Autonomous Delivery Verification ────────────────────
async function getLLMDeliveryDecision({ bookingId, booking, proofType, proofData, diversionRisk, proofValid }) {
  const prompt = `You are an autonomous booking agent finalizing a gas delivery for GasSafe.

=== DELIVERY DATA ===
Booking ID: ${bookingId}
Risk Tier: ${booking.riskTier} (${booking.riskLabel})
Original Fraud Score: ${booking.fraudScore}/100
Required Verification: ${booking.verificationRequired}
Provided Proof Type: ${proofType}
Proof Valid (rule check): ${proofValid.valid} ${proofValid.reason ? "— " + proofValid.reason : ""}
Delivery Diversion Risk: ${diversionRisk.flagged ? "FLAGGED — " + diversionRisk.message : "Clear"}
Nearby deliveries in last hour: ${diversionRisk.nearbyCount || 0}

=== YOUR TASK ===
Make an autonomous decision on whether to RELEASE the subsidy.
- RELEASE: confirm delivery, release escrow on-chain
- REJECT: deny delivery (invalid proof or diversion)
- ESCALATE: flag for human review before releasing
Respond ONLY with this JSON:
{
  "delivery_decision": "RELEASE|REJECT|ESCALATE",
  "decision_reason": "2 sentence explanation",
  "confidence": 0.0,
  "diversion_assessment": "CLEAR|SUSPICIOUS|CONFIRMED"
}`;

  try {
    const response = await llmClient.chat.completions.create({
      model: LLM_MODEL,
      max_tokens: 250,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }]
    });
    const raw = response.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in LLM response");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("[bookingAgent] LLM delivery decision failed:", err.message);
    return {
      delivery_decision: proofValid.valid && !diversionRisk.flagged ? "RELEASE" : "REJECT",
      decision_reason: `Fallback rule: proof=${proofValid.valid}, diversion=${diversionRisk.flagged}. LLM unavailable.`,
      confidence: 0.75,
      diversion_assessment: diversionRisk.flagged ? "SUSPICIOUS" : "CLEAR",
      llm_fallback: true
    };
  }
}

// ── Register User ─────────────────────────────────────────────
async function registerUser({ name, aadhaarNumber, walletAddress, lat, lon, pincode, phone }) {
  const traceId = uuidv4();
  const db = readDB();

  const isDuplicateWallet = !!db.users[walletAddress];
  const addressHash = hashAddress(lat, lon, pincode);
  const dupAddress = Object.values(db.users).find(u => u.addressHash === addressHash);
  const isDuplicate = isDuplicateWallet || !!dupAddress;
  const duplicateReason = isDuplicateWallet ? "DUPLICATE_WALLET" : dupAddress ? "DUPLICATE_ADDRESS" : null;

  console.log(`[bookingAgent] Registration request for ${name} — calling LLM for autonomous decision...`);
  const llmDecision = await getLLMRegistrationDecision({ name, walletAddress, lat, lon, pincode, phone, isDuplicate, duplicateReason });
  console.log(`[bookingAgent] LLM registration decision: ${llmDecision.decision} (confidence: ${llmDecision.confidence})`);

  if (llmDecision.decision === "REJECT" || isDuplicate) {
    const reason = duplicateReason === "DUPLICATE_WALLET"
      ? "Wallet already registered"
      : duplicateReason === "DUPLICATE_ADDRESS"
        ? "GS_DUPLICATE_ADDRESS: This address already has an active gas connection"
        : llmDecision.reason;

    logDecision({
      agentId: AGENT_ID, traceId, decisionType: "REGISTRATION_REJECTED",
      inputs: { walletAddress, addressHash },
      reasoning: {
        factors: [], summary: llmDecision.reason,
        autonomous_action: "REJECT", llm_model: LLM_MODEL, llm_confidence: llmDecision.confidence
      },
      output: { rejected: true, reason: duplicateReason || "LLM_REJECT", llm_decision: llmDecision },
      confidence: llmDecision.confidence, overrideable: false
    });

    return { success: false, error: reason, traceId, llm_decision: llmDecision };
  }

  const zkp = generateMockZKP(aadhaarNumber, addressHash);
  const txResult = await chain.issueSBT(walletAddress, addressHash, zkp.commitment);

  db.users[walletAddress] = {
    walletAddress, name, phone, addressHash,
    zkpCommitment: zkp.commitment,
    vouchersRemaining: 12,
    riskTier: 0,
    registeredAt: new Date().toISOString(),
    sbtTxHash: txResult.txHash
  };
  writeDB(db);

  logDecision({
    agentId: AGENT_ID, traceId, decisionType: "USER_REGISTERED",
    inputs: { walletAddress, addressHash: addressHash.slice(0, 16) + "..." },
    reasoning: {
      factors: [
        { name: "ZKP Verified", value: zkp.verified, weight: 1, contribution: 1 },
        { name: "Duplicate Check", value: "PASSED", weight: 1, contribution: 1 },
        { name: "LLM Decision", value: llmDecision.decision, weight: 1, contribution: 1 }
      ],
      summary: `${llmDecision.reason} SBT issued. Tx: ${txResult.txHash}`,
      autonomous_action: "APPROVE", llm_model: LLM_MODEL, llm_confidence: llmDecision.confidence
    },
    output: { sbtIssued: true, txHash: txResult.txHash, vouchersGranted: 12, llm_decision: llmDecision },
    confidence: llmDecision.confidence, onchainTx: txResult.txHash, overrideable: false
  });

  return { success: true, traceId, txHash: txResult.txHash, walletAddress, vouchersRemaining: 12, llm_decision: llmDecision };
}

// ── Book Gas ──────────────────────────────────────────────────
async function bookGas({ walletAddress, deviceId, ipAddress, ipIsVpn = false, deliveryLat, deliveryLon, isRural = false }) {
  const traceId = uuidv4();
  const bookingId = "BK-" + Date.now();
  const db = readDB();

  const user = db.users[walletAddress];
  if (!user) return { success: false, error: "User not registered", traceId };
  if (user.vouchersRemaining <= 0) return { success: false, error: "No vouchers remaining", traceId };

  const intervals = Object.values(db.bookings)
    .filter(b => b.walletAddress === walletAddress && b.status === "DELIVERED")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((b, i, arr) => i === 0 ? 30 : Math.round((new Date(b.createdAt) - new Date(arr[i - 1].createdAt)) / 86400000));

  // Step 1: Send to scoring agent
  const scoreRequest = buildMessage(AGENT_ID, "scoring-agent", "SCORE_REQUEST", {
    bookingId, sbtAddress: walletAddress, deviceId,
    ipAddress: ipAddress || "0.0.0.0",
    ipIsVpn, daysSinceLastBooking: intervals[intervals.length - 1] || 30,
    deliveryLat, deliveryLon,
    registeredLat: parseFloat(process.env.DEFAULT_LAT || "18.52"),
    registeredLon: parseFloat(process.env.DEFAULT_LON || "73.86"),
    historicalBookingIntervals: intervals,
    isRural, isKnownSharedDevice: false
  }, traceId);

  const scoreResponse = await handleScoreRequest(scoreRequest);
  const scorePayload = scoreResponse.payload;

  // Step 2: Booking agent makes autonomous final decision
  console.log(`[bookingAgent] Scoring agent done. Calling LLM for final autonomous booking decision on ${bookingId}...`);
  const llmDecision = await getLLMBookingDecision({ bookingId, walletAddress, user, scorePayload });
  console.log(`[bookingAgent] Final decision: ${llmDecision.final_decision} (confidence: ${llmDecision.confidence})`);

  // If REJECT, return early
  if (llmDecision.final_decision === "REJECT") {
    return {
      success: false,
      error: `Booking autonomously rejected: ${llmDecision.decision_reason}`,
      traceId, bookingId,
      fraud_score: scorePayload.fraud_score,
      llm_decision: llmDecision
    };
  }

  // Step 3: Generate OTP for delivery verification
  const { otp, otpHash } = generateOTP();
  console.log(`[bookingAgent] OTP generated for booking ${bookingId}: ${otp}`);

  // Step 4: Lock subsidy on-chain
  const txResult = await chain.lockSubsidy(bookingId, walletAddress, scorePayload.risk_tier, scorePayload.fraud_score, traceId);

  db.bookings[bookingId] = {
    bookingId, walletAddress, deviceId,
    fraudScore: scorePayload.fraud_score,
    riskTier: scorePayload.risk_tier,
    riskLabel: scorePayload.risk_label,
    verificationRequired: scorePayload.verification_required,
    status: llmDecision.final_decision === "HOLD" ? "ON_HOLD" : "PENDING",
    createdAt: new Date().toISOString(),
    escrowTxHash: txResult.txHash,
    traceId,
    agentScoreDleId: scoreResponse.dle_id,
    llmDecision: llmDecision,
    autonomousAction: llmDecision.final_decision,
    otpHash   // stored hashed — never expose plain OTP at rest
  };
  db.users[walletAddress].vouchersRemaining--;
  writeDB(db);

  logDecision({
    agentId: AGENT_ID, traceId, decisionType: "BOOKING_CREATED",
    inputs: { bookingId, walletAddress, fraudScore: scorePayload.fraud_score },
    reasoning: {
      factors: [
        { name: "Fraud Score", value: scorePayload.fraud_score, weight: 1, contribution: scorePayload.fraud_score },
        { name: "Risk Tier", value: scorePayload.risk_label, weight: 1, contribution: scorePayload.risk_tier },
        { name: "Scoring Agent Action", value: scorePayload.autonomous_action, weight: 1, contribution: 1 },
        { name: "Booking Agent Final", value: llmDecision.final_decision, weight: 1, contribution: 1 }
      ],
      summary: llmDecision.decision_reason,
      autonomous_action: llmDecision.final_decision,
      llm_model: LLM_MODEL,
      llm_confidence: llmDecision.confidence,
      override_scoring_agent: llmDecision.override_scoring_agent
    },
    output: {
      bookingId, fraudScore: scorePayload.fraud_score,
      riskTier: scorePayload.risk_tier, escrowTxHash: txResult.txHash,
      llm_decision: llmDecision
    },
    confidence: llmDecision.confidence, onchainTx: txResult.txHash, overrideable: true
  });

  return {
    success: true, traceId, bookingId,
    fraudScore: scorePayload.fraud_score,
    riskTier: scorePayload.risk_tier,
    riskLabel: scorePayload.risk_label,
    verificationRequired: scorePayload.verification_required,
    escrowTxHash: txResult.txHash,
    bookingStatus: db.bookings[bookingId].status,
    // OTP — share this with the beneficiary; delivery agent must submit it
    otp,
    otpNote: "Share this 6-digit OTP with the delivery agent. It is required to confirm delivery.",
    // Full autonomous decision trail
    scoring_agent: {
      action: scorePayload.autonomous_action,
      reasoning: scorePayload.llm_reasoning,
      confidence: scorePayload.llm_confidence
    },
    booking_agent: {
      final_decision: llmDecision.final_decision,
      reason: llmDecision.decision_reason,
      confidence: llmDecision.confidence,
      priority: llmDecision.priority
    }
  };
}

// ── Confirm Delivery ──────────────────────────────────────────
async function confirmDelivery({ bookingId, proofType, proofData, agentAddress, agentLat, agentLon }) {
  const traceId = uuidv4();
  const db = readDB();
  const booking = db.bookings[bookingId];

  if (!booking) return { success: false, error: "Booking not found", traceId };
  if (booking.status !== "PENDING") return { success: false, error: `Booking status is ${booking.status}, expected PENDING`, traceId };

  const proofValid = validateProof(booking.riskTier, proofType, proofData, booking);
  const diversionRisk = checkDeliveryDiversion(agentAddress, agentLat, agentLon, db);

  // LLM autonomous delivery decision
  console.log(`[bookingAgent] Calling LLM for autonomous delivery decision on ${bookingId}...`);
  const llmDecision = await getLLMDeliveryDecision({ bookingId, booking, proofType, proofData, diversionRisk, proofValid });
  console.log(`[bookingAgent] Delivery decision: ${llmDecision.delivery_decision} (confidence: ${llmDecision.confidence})`);

  if (llmDecision.delivery_decision === "REJECT" || !proofValid.valid) {
    return {
      success: false,
      error: proofValid.reason || `Delivery autonomously rejected: ${llmDecision.decision_reason}`,
      traceId,
      llm_decision: llmDecision
    };
  }

  if (llmDecision.delivery_decision === "ESCALATE") {
    // Override LLM if proof is valid and no diversion — LLM is being overly cautious
    if (proofValid.valid && !diversionRisk.flagged) {
      llmDecision.delivery_decision = "RELEASE";
      llmDecision.confidence = 1.0;
    } else {
      db.bookings[bookingId].status = "ESCALATED";
      writeDB(db);
      return {
        success: false,
        error: `Delivery escalated for human review: ${llmDecision.decision_reason}`,
        traceId,
        llm_decision: llmDecision,
        escalated: true
      };
    }
  }

  // RELEASE: confirm on-chain
  const agencyAddr = agentAddress || "0x0000000000000000000000000000000000000001";
  const txResult = await chain.releaseSubsidy(bookingId, proofData, agencyAddr);

  db.bookings[bookingId] = {
    ...db.bookings[bookingId],
    status: "DELIVERED",
    proofType, proofData,
    deliveredAt: new Date().toISOString(),
    releaseTxHash: txResult.txHash,
    agentLat, agentLon,
    llmDeliveryDecision: llmDecision
  };
  db.deliveries[bookingId] = {
    bookingId,
    walletAddress: booking.walletAddress,
    releaseTxHash: txResult.txHash,
    deliveredAt: db.bookings[bookingId].deliveredAt,
    proofType,
    agentAddress,
    riskTier: booking.riskTier,
    fraudScore: booking.fraudScore
  };
  writeDB(db);

  logDecision({
    agentId: AGENT_ID, traceId: booking.traceId, decisionType: "DELIVERY_CONFIRMED",
    inputs: { bookingId, proofType, agentLat, agentLon },
    reasoning: {
      factors: [
        { name: "Proof Valid", value: proofValid.valid, weight: 1, contribution: 1 },
        { name: "Diversion Risk", value: diversionRisk.flagged, weight: 1, contribution: diversionRisk.flagged ? 1 : 0 },
        { name: "LLM Decision", value: llmDecision.delivery_decision, weight: 1, contribution: 1 }
      ],
      summary: llmDecision.decision_reason,
      autonomous_action: llmDecision.delivery_decision,
      llm_model: LLM_MODEL,
      llm_confidence: llmDecision.confidence,
      diversion_assessment: llmDecision.diversion_assessment
    },
    output: {
      delivered: true, releaseTxHash: txResult.txHash,
      diversionRisk, llm_decision: llmDecision
    },
    confidence: llmDecision.confidence, onchainTx: txResult.txHash, overrideable: false
  });

  return {
    success: true,
    traceId: booking.traceId,
    bookingId,
    releaseTxHash: txResult.txHash,
    diversionRisk,
    delivery_agent: {
      decision: llmDecision.delivery_decision,
      reason: llmDecision.decision_reason,
      diversion_assessment: llmDecision.diversion_assessment,
      confidence: llmDecision.confidence
    }
  };
}

function validateProof(riskTier, proofType, proofData, booking) {
  if (riskTier === 0 && proofType !== "OTP") return { valid: false, reason: "GREEN tier requires OTP" };
  if (riskTier === 1 && proofType !== "PHOTO") return { valid: false, reason: "YELLOW tier requires PHOTO" };
  if (riskTier === 2 && proofType !== "FACE_AUTH") return { valid: false, reason: "RED tier requires FACE_AUTH" };
  if (!proofData || proofData.length < 4) return { valid: false, reason: "Invalid proof data" };

  // ── OTP Validation ──────────────────────────────────────────
  if (proofType === "OTP") {
    if (!booking || !booking.otpHash) {
      return { valid: false, reason: "No OTP on record for this booking" };
    }
    const submittedHash = crypto.createHash("sha256").update(proofData.trim()).digest("hex");
    if (submittedHash !== booking.otpHash) {
      return { valid: false, reason: "Invalid OTP — delivery verification failed" };
    }
  }

  return { valid: true };
}

function checkDeliveryDiversion(agentAddress, lat, lon, db) {
  if (!lat || !lon) return { flagged: false, nearbyCount: 0 };
  const oneHourAgo = Date.now() - 3600000;
  const recent = Object.values(db.bookings)
    .filter(b => b.status === "DELIVERED" && new Date(b.deliveredAt || 0).getTime() > oneHourAgo);

  let nearbyCount = 0;
  for (const b of recent) {
    if (b.agentLat && Math.abs(b.agentLat - lat) < 0.0001 && Math.abs(b.agentLon - lon) < 0.0001) {
      nearbyCount++;
    }
  }
  return {
    flagged: nearbyCount > 8,
    nearbyCount,
    message: nearbyCount > 8 ? "Commercial diversion suspected!" : "Normal"
  };
}

module.exports = { registerUser, bookGas, confirmDelivery };