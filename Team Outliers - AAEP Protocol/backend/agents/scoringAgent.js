// scoringAgent.js — AAEP Agent 2: Autonomous AI Fraud Scoring
// LLM: meta-llama/Llama-3.1-8B-Instruct via Novita (HuggingFace Router)

const { logDecision } = require("./auditLogger");
const { v4: uuidv4 } = require("uuid");
const OpenAI = require("openai");

const AGENT_ID = "scoring-agent";
const AGENT_MANIFEST = {
  agent_id: AGENT_ID,
  agent_type: "SCORING",
  version: "2.0.0",
  capabilities: ["sybil_detection", "hoarder_detection", "gps_analysis", "fraud_scoring", "llm_reasoning", "autonomous_decision"],
  permissions: ["SCORE", "REASON", "ESCALATE"]
};

// ── Novita LLM Client ─────────────────────────────────────────
const llmClient = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

const LLM_MODEL = "meta-llama/Llama-3.1-8B-Instruct:novita";

// ── In-memory rolling window (last 60 min) ────────────────────
const recentBookings = [];
const WINDOW_MS = 60 * 60 * 1000;

function pruneWindow() {
  const cutoff = Date.now() - WINDOW_MS;
  while (recentBookings.length > 0 && recentBookings[0].timestamp < cutoff) {
    recentBookings.shift();
  }
}

// ── Model A: Sybil Ring Detector ──────────────────────────────
function detectSybilScore(deviceId, ipSubnet) {
  pruneWindow();
  const sameDevice = recentBookings.filter(b => b.deviceId === deviceId);
  const sameSubnet = recentBookings.filter(b => b.ipSubnet === ipSubnet);
  const clusterSize = Math.max(sameDevice.length, sameSubnet.length);

  let score = 0;
  if (clusterSize > 2) score = Math.min(10 * (clusterSize - 2), 90);

  return {
    score, clusterSize,
    sameDeviceCount: sameDevice.length,
    sameSubnetCount: sameSubnet.length,
    rawSignal: clusterSize <= 2
      ? `Only ${clusterSize} bookings from this device/subnet in last hour`
      : `${clusterSize} bookings from same device/subnet in 60 min — cluster detected`
  };
}

// ── Model B: Hoarder Detector ─────────────────────────────────
function detectHoarderScore(intervals) {
  if (!intervals || intervals.length < 4) {
    return { score: 0, rawSignal: "Insufficient history to evaluate hoarder pattern" };
  }
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  const minInterval = Math.min(...intervals);
  const isTooRegular = stdDev < 2;
  const isTooFast = minInterval < 16;

  let rawScore = 0;
  if (isTooFast) rawScore += 40;
  if (isTooRegular) rawScore += 30;
  if (intervals[intervals.length - 1] < 16) rawScore += 15;
  const score = Math.min(rawScore, 70);

  return {
    score, mean: mean.toFixed(1), stdDev: stdDev.toFixed(2),
    minInterval, isTooRegular, isTooFast,
    rawSignal: `Min interval=${minInterval}d, std=${stdDev.toFixed(1)}, avg=${mean.toFixed(0)}d`
  };
}

// ── Model C: GPS Analysis ─────────────────────────────────────
function detectGpsScore(deliveryLat, deliveryLon, registeredLat, registeredLon) {
  if (!deliveryLat || !registeredLat) return { score: 0, rawSignal: "No GPS data available" };

  const R = 6371000;
  const dLat = (deliveryLat - registeredLat) * Math.PI / 180;
  const dLon = (deliveryLon - registeredLon) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(registeredLat * Math.PI / 180) * Math.cos(deliveryLat * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const distanceMeters = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  let score = 0;
  if (distanceMeters > 500) score = 30;
  if (distanceMeters > 2000) score = 60;
  if (distanceMeters > 5000) score = 100;

  return {
    score, distanceMeters: Math.round(distanceMeters),
    rawSignal: `Delivery is ${Math.round(distanceMeters)}m from registered address`
  };
}

// ── Risk Tier Mapping ─────────────────────────────────────────
function getTier(score) {
  if (score <= 30) return { tier: 0, label: "GREEN", verification: "SMS OTP" };
  if (score <= 75) return { tier: 1, label: "YELLOW", verification: "Photo of cylinder" };
  return { tier: 2, label: "RED", verification: "Live Face Auth" };
}

function applyRuralDiscount(sybilResult, isRural, isKnownSharedDevice) {
  if ((isRural || isKnownSharedDevice) && sybilResult.score > 0) {
    const discounted = Math.round(sybilResult.score * 0.4);
    return { ...sybilResult, score: discounted, ruralDiscountApplied: true };
  }
  return sybilResult;
}

// ── LLM: Autonomous Fraud Reasoning ──────────────────────────
async function getLLMFraudReasoning(payload, models, compositeScore, tierInfo) {
  const { bookingId, sbtAddress, deviceId, ipAddress, ipIsVpn, isRural, isKnownSharedDevice, daysSinceLastBooking } = payload;

  const prompt = `You are an autonomous fraud detection agent for GasSafe, a subsidized LPG gas booking system in India.
Analyze the fraud signals below and make an AUTONOMOUS DECISION on this booking.

=== BOOKING ===
ID: ${bookingId} | Wallet: ${sbtAddress} | Device: ${deviceId}
IP: ${ipAddress} ${ipIsVpn ? "(VPN)" : ""} | Days since last booking: ${daysSinceLastBooking}
Rural area: ${isRural} | Shared device: ${isKnownSharedDevice}

=== FRAUD SCORES ===
Sybil Ring (55% weight): ${models.sybil.score}/100 — ${models.sybil.rawSignal}${models.sybil.ruralDiscountApplied ? " [rural discount applied]" : ""}
Hoarder Pattern (30% weight): ${models.hoarder.score}/100 — ${models.hoarder.rawSignal}
GPS Mismatch (15% weight): ${models.gps.score}/100 — ${models.gps.rawSignal}

Final Score: ${compositeScore}/100 | Risk: ${tierInfo.label} | Verification: ${tierInfo.verification}

=== TASK ===
Make an autonomous decision. Consider rural/shared-device context as possible false positives.
Respond ONLY with this JSON (no other text):
{
  "reasoning": "2-3 sentence explanation specific to this booking",
  "primary_signal": "SYBIL|HOARDER|GPS|CLEAN",
  "autonomous_action": "APPROVE|ESCALATE|FLAG_FOR_REVIEW",
  "action_reason": "one sentence why",
  "confidence": 0.0,
  "false_positive_risk": "LOW|MEDIUM|HIGH",
  "recommended_human_review": true
}`;

  try {
    const response = await llmClient.chat.completions.create({
      model: LLM_MODEL,
      max_tokens: 400,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    });

    const raw = response.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("LLM returned no JSON");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("[scoringAgent] LLM error, using fallback:", err.message);
    return {
      reasoning: `Booking ${bookingId} scored ${compositeScore}/100 via rule-based fallback. ${models.sybil.rawSignal}. ${models.hoarder.rawSignal}. ${models.gps.rawSignal}.`,
      primary_signal: compositeScore === 0 ? "CLEAN" : models.sybil.score >= models.hoarder.score ? "SYBIL" : "HOARDER",
      autonomous_action: compositeScore <= 30 ? "APPROVE" : compositeScore <= 75 ? "FLAG_FOR_REVIEW" : "ESCALATE",
      action_reason: "LLM unavailable — rule-based fallback decision",
      confidence: 0.7,
      false_positive_risk: isRural ? "MEDIUM" : "LOW",
      recommended_human_review: compositeScore > 50,
      llm_fallback: true
    };
  }
}

// ── Main Handler ──────────────────────────────────────────────
async function handleScoreRequest(message) {
  const { trace_id, payload } = message;
  const {
    bookingId, sbtAddress, deviceId, ipAddress, ipIsVpn,
    daysSinceLastBooking, deliveryLat, deliveryLon, registeredLat, registeredLon,
    historicalBookingIntervals, isRural = false, isKnownSharedDevice = false
  } = payload;

  const ipSubnet = ipAddress ? ipAddress.split(".").slice(0, 3).join(".") : "unknown";

  let sybilResult = detectSybilScore(deviceId, ipSubnet);
  sybilResult = applyRuralDiscount(sybilResult, isRural, isKnownSharedDevice);
  if (ipIsVpn) sybilResult = { ...sybilResult, score: Math.max(0, sybilResult.score - 20), vpnAdjusted: true };

  const hoarderResult = detectHoarderScore(historicalBookingIntervals);
  const gpsResult = detectGpsScore(deliveryLat, deliveryLon, registeredLat, registeredLon);

  const rawScore = 0.55 * sybilResult.score + 0.30 * hoarderResult.score + 0.15 * gpsResult.score;
  const finalScore = Math.min(100, Math.round(rawScore));
  const tierInfo = getTier(finalScore);
  const models = { sybil: sybilResult, hoarder: hoarderResult, gps: gpsResult };

  console.log(`[scoringAgent] Booking ${bookingId}: score=${finalScore}, calling LLM for autonomous reasoning...`);
  const llmDecision = await getLLMFraudReasoning(payload, models, finalScore, tierInfo);
  console.log(`[scoringAgent] LLM decision: ${llmDecision.autonomous_action} (confidence: ${llmDecision.confidence})`);

  const output = {
    fraud_score: finalScore,
    risk_tier: tierInfo.tier,
    risk_label: tierInfo.label,
    verification_required: tierInfo.verification,
    model_breakdown: models,
    // Autonomous LLM decision
    llm_reasoning: llmDecision.reasoning,
    autonomous_action: llmDecision.autonomous_action,
    action_reason: llmDecision.action_reason,
    primary_signal: llmDecision.primary_signal,
    false_positive_risk: llmDecision.false_positive_risk,
    recommended_human_review: llmDecision.recommended_human_review,
    llm_confidence: llmDecision.confidence,
    llm_model: LLM_MODEL
  };

  recentBookings.push({ sbtAddress, deviceId, ipSubnet, timestamp: Date.now() });

  const dle = logDecision({
    agentId: AGENT_ID,
    traceId: trace_id,
    decisionType: "FRAUD_SCORE",
    inputs: payload,
    reasoning: {
      factors: [
        { name: "Sybil Ring Detection", value: sybilResult.score, weight: 0.55, contribution: Math.round(0.55 * sybilResult.score) },
        { name: "Hoarder Pattern", value: hoarderResult.score, weight: 0.30, contribution: Math.round(0.30 * hoarderResult.score) },
        { name: "GPS Mismatch", value: gpsResult.score, weight: 0.15, contribution: Math.round(0.15 * gpsResult.score) }
      ],
      summary: llmDecision.reasoning,
      autonomous_action: llmDecision.autonomous_action,
      llm_model: LLM_MODEL,
      llm_confidence: llmDecision.confidence
    },
    output,
    confidence: llmDecision.confidence,
    overrideable: true
  });

  return {
    aaep_version: "1.0",
    message_id: uuidv4(),
    trace_id,
    timestamp: new Date().toISOString(),
    from: AGENT_ID,
    to: "booking-agent",
    intent: "SCORE_RESPONSE",
    payload: output,
    dle_id: dle.dle_id
  };
}

module.exports = { handleScoreRequest, AGENT_MANIFEST };