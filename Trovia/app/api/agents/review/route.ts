import { NextResponse } from "next/server";
import { callGemini } from "../../../../lib/gemini";

type ReviewRequestBody = {
  name?: string;
  description?: string;
  agentType?: string;
  price?: string;
  configSchema?: string;
  workflowSummary?: string;
};

type ReviewVerdict = "approve" | "review" | "block";
type RiskLevel = "low" | "medium" | "high" | "critical";
type FindingSeverity = "low" | "medium" | "high" | "critical";

type ReviewFinding = {
  severity: FindingSeverity;
  title: string;
  detail: string;
};

type ReviewResult = {
  verdict: ReviewVerdict;
  riskLevel: RiskLevel;
  summary: string;
  findings: ReviewFinding[];
  recommendedChanges: string[];
  userSafetyNotes: string[];
  source: "heuristic" | "gemini" | "gemini+heuristic";
};

const BLOCK_PATTERNS: Array<{ pattern: RegExp; title: string; detail: string }> = [
  {
    pattern: /\b(seed phrase|secret phrase|private key|mnemonic)\b/i,
    title: "Sensitive wallet secret access",
    detail: "The submission references wallet secrets. Legitimate agents should never request seed phrases or private keys."
  },
  {
    pattern: /\b(drain|steal|rug|sweep.*wallet|empty.*wallet|transfer all funds)\b/i,
    title: "Possible wallet-draining behavior",
    detail: "The workflow appears to move or seize user funds in an unsafe or unauthorized way."
  },
  {
    pattern: /\b(phishing|impersonat|launder|mixer|blackmail|ransom|bypass kyc|illegal)\b/i,
    title: "Potentially illegal or unethical use case",
    detail: "The description suggests behavior that may be illegal, abusive, or clearly unethical."
  }
];

const REVIEW_PATTERNS: Array<{ pattern: RegExp; title: string; detail: string; severity: FindingSeverity }> = [
  {
    pattern: /\b(unlimited approval|infinite approval|approve max|approve unlimited)\b/i,
    title: "Unlimited approval wording",
    detail: "The workflow mentions broad token approvals. This should be narrowed to the minimum amount necessary.",
    severity: "high"
  },
  {
    pattern: /\b(custodial|holds user funds|takes custody|escrow all funds)\b/i,
    title: "Custodial fund handling",
    detail: "The agent may take custody of user funds. The publish listing should disclose exactly how user funds are handled.",
    severity: "medium"
  },
  {
    pattern: /\b(auto-sign|sign transactions for user|silent transaction|without confirmation)\b/i,
    title: "Transaction consent concern",
    detail: "The workflow implies transaction signing without explicit user confirmation.",
    severity: "critical"
  }
];

const BLOCK_TITLES = new Set([
  "Sensitive wallet secret access",
  "Possible wallet-draining behavior",
  "Potentially illegal or unethical use case"
]);

type SafetyGuards = {
  protectsSecrets: boolean;
  deniesAutoSign: boolean;
  deniesTransfers: boolean;
};

function clampRiskLevel(levels: RiskLevel[]): RiskLevel {
  if (levels.includes("critical")) return "critical";
  if (levels.includes("high")) return "high";
  if (levels.includes("medium")) return "medium";
  return "low";
}

function severityToRiskLevel(severity: FindingSeverity): RiskLevel {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function normalizeVerdict(verdict: string | undefined): ReviewVerdict {
  if (verdict === "block" || verdict === "review" || verdict === "approve") {
    return verdict;
  }
  return "review";
}

function normalizeRiskLevel(level: string | undefined): RiskLevel {
  if (level === "critical" || level === "high" || level === "medium" || level === "low") {
    return level;
  }
  return "medium";
}

function normalizeFindings(input: unknown): ReviewFinding[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Partial<ReviewFinding>;
      if (!record.title || !record.detail) {
        return null;
      }

      const severity =
        record.severity === "low" ||
        record.severity === "medium" ||
        record.severity === "high" ||
        record.severity === "critical"
          ? record.severity
          : "medium";

      return {
        severity,
        title: record.title,
        detail: record.detail
      } satisfies ReviewFinding;
    })
    .filter((entry): entry is ReviewFinding => entry !== null);
}

function normalizeStringList(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
}

function buildSubmissionText(body: Required<ReviewRequestBody>) {
  return [
    `Name: ${body.name}`,
    `Type: ${body.agentType}`,
    `Price: ${body.price} HLUSD`,
    `Description: ${body.description}`,
    `Config Schema: ${body.configSchema}`,
    `Workflow Summary: ${body.workflowSummary}`
  ].join("\n");
}

function hasNegationContext(haystack: string, index: number, length: number): boolean {
  const windowStart = Math.max(0, index - 80);
  const windowEnd = Math.min(haystack.length, index + length + 30);
  const context = haystack.slice(windowStart, windowEnd).toLowerCase();

  return (
    /\b(never|do not|does not|must not|cannot|can't|won't|will not|without)\b/.test(context) &&
    /\b(request|ask|collect|store|sign|auto-sign|approve|transfer|move|hold|custody|use)\b/.test(context)
  );
}

function hasActivePatternMatch(haystack: string, pattern: RegExp): boolean {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const regex = new RegExp(pattern.source, flags);
  let match: RegExpExecArray | null = regex.exec(haystack);

  while (match) {
    if (!hasNegationContext(haystack, match.index, match[0].length)) {
      return true;
    }
    match = regex.exec(haystack);
  }

  return false;
}

function detectSafetyGuards(haystack: string): SafetyGuards {
  const lowered = haystack.toLowerCase();

  return {
    protectsSecrets:
      /\b(never|do not|does not|must not|will not)\b.{0,35}\b(request|ask|collect|store)\b.{0,35}\b(seed phrase|secret phrase|private key|mnemonic)\b/.test(lowered),
    deniesAutoSign:
      /\b(never|do not|does not|must not|will not)\b.{0,25}\b(auto-sign|sign transactions?|silent transaction)\b/.test(lowered),
    deniesTransfers:
      /\b(never|do not|does not|must not|will not)\b.{0,30}\b(transfer|send|move)\b.{0,20}\b(funds|tokens|assets|wallet)\b/.test(lowered) ||
      /\b(text-only|no blockchain transactions?)\b/.test(lowered)
  };
}

function filterContradictoryFindings(findings: ReviewFinding[], guards: SafetyGuards): ReviewFinding[] {
  return findings.filter((finding) => {
    const title = finding.title.toLowerCase();
    const detail = finding.detail.toLowerCase();

    if (guards.deniesAutoSign && (title.includes("transaction consent") || detail.includes("without explicit user confirmation"))) {
      return false;
    }

    if (guards.protectsSecrets && (title.includes("wallet secret") || detail.includes("seed phrases or private keys"))) {
      return false;
    }

    if (guards.deniesTransfers && (title.includes("wallet-draining") || detail.includes("move or seize user funds"))) {
      return false;
    }

    return true;
  });
}

function recalculateOutcome(base: ReviewResult): ReviewResult {
  const riskLevel = base.findings.length
    ? clampRiskLevel(base.findings.map((finding) => severityToRiskLevel(finding.severity)))
    : "low";

  const hasBlockFinding = base.findings.some((finding) => finding.severity === "critical" && BLOCK_TITLES.has(finding.title));
  const hasReviewLevelFinding = base.findings.some(
    (finding) => finding.severity === "medium" || finding.severity === "high" || finding.severity === "critical"
  );
  const verdict: ReviewVerdict = hasBlockFinding ? "block" : hasReviewLevelFinding ? "review" : "approve";

  const summary =
    verdict === "approve"
      ? "No strong malicious signals were detected from the submitted metadata and workflow summary."
      : verdict === "review"
        ? "The submission has risk signals that should be clarified before publishing."
        : "The submission appears unsafe or clearly inappropriate for marketplace publication.";

  return {
    ...base,
    verdict,
    riskLevel,
    summary
  };
}

function heuristicReview(body: Required<ReviewRequestBody>): ReviewResult {
  const haystack = buildSubmissionText(body);
  const findings: ReviewFinding[] = [];
  const recommendedChanges: string[] = [];
  const riskSignals: RiskLevel[] = ["low"];
  let verdict: ReviewVerdict = "approve";

  for (const entry of BLOCK_PATTERNS) {
    if (hasActivePatternMatch(haystack, entry.pattern)) {
      findings.push({
        severity: "critical",
        title: entry.title,
        detail: entry.detail
      });
      riskSignals.push("critical");
      verdict = "block";
    }
  }

  for (const entry of REVIEW_PATTERNS) {
    if (hasActivePatternMatch(haystack, entry.pattern)) {
      findings.push({
        severity: entry.severity,
        title: entry.title,
        detail: entry.detail
      });
      riskSignals.push(entry.severity === "critical" ? "critical" : entry.severity === "high" ? "high" : "medium");
      if (verdict !== "block") {
        verdict = "review";
      }
    }
  }

  if (!body.workflowSummary.trim()) {
    findings.push({
      severity: "medium",
      title: "Missing workflow explanation",
      detail: "The developer has not explained how the agent behaves or interacts with user funds."
    });
    recommendedChanges.push("Add a clear workflow summary describing permissions, fund movement, and user confirmations.");
    riskSignals.push("medium");
    if (verdict !== "block") {
      verdict = "review";
    }
  }

  if (!findings.length) {
    recommendedChanges.push("Keep the workflow transparent and clearly disclose any fund approvals or transfers.");
  }

  const result: ReviewResult = {
    verdict,
    riskLevel: clampRiskLevel(riskSignals),
    summary:
      verdict === "approve"
        ? "No strong malicious signals were detected from the submitted metadata and workflow summary."
        : verdict === "review"
          ? "The submission has risk signals that should be clarified before publishing."
          : "The submission appears unsafe or clearly inappropriate for marketplace publication.",
    findings,
    recommendedChanges,
    userSafetyNotes: [
      "This review checks declared metadata and workflow descriptions, not full bytecode guarantees.",
      "Users should still verify approvals, wallet prompts, and the agent's documented behavior."
    ],
    source: "heuristic"
  };

  const guards = detectSafetyGuards(haystack);
  return recalculateOutcome({
    ...result,
    findings: filterContradictoryFindings(result.findings, guards)
  });
}

function mergeReviewResults(heuristic: ReviewResult, gemini: ReviewResult): ReviewResult {
  const verdictOrder: ReviewVerdict[] = ["approve", "review", "block"];
  const verdict =
    verdictOrder.indexOf(gemini.verdict) > verdictOrder.indexOf(heuristic.verdict) ? gemini.verdict : heuristic.verdict;

  return {
    verdict,
    riskLevel: clampRiskLevel([heuristic.riskLevel, gemini.riskLevel]),
    summary:
      verdict === heuristic.verdict && verdict !== "approve"
        ? heuristic.summary
        : gemini.summary || heuristic.summary,
    findings: [...heuristic.findings, ...gemini.findings],
    recommendedChanges: Array.from(new Set([...heuristic.recommendedChanges, ...gemini.recommendedChanges])),
    userSafetyNotes: Array.from(new Set([...heuristic.userSafetyNotes, ...gemini.userSafetyNotes])),
    source: "gemini+heuristic"
  };
}

async function geminiReview(body: Required<ReviewRequestBody>): Promise<ReviewResult> {
  const systemInstruction = [
    "You are a security and ethics reviewer for an AI agent marketplace.",
    "Your job is to detect unsafe, unethical, illegal, scammy, or wallet-draining behavior.",
    "You are reviewing only the declared listing metadata, config schema, and workflow summary.",
    "Return valid JSON only. No markdown."
  ].join("\n");

  const prompt = [
    "Review this proposed marketplace agent.",
    "Focus on whether it could steal wallet funds, request secrets, bypass user consent, or promote illegal/unethical activity.",
    "Be conservative and practical for a hackathon demo marketplace.",
    "",
    buildSubmissionText(body),
    "",
    'Return JSON with this exact shape:',
    '{"verdict":"approve|review|block","riskLevel":"low|medium|high|critical","summary":"string","findings":[{"severity":"low|medium|high|critical","title":"string","detail":"string"}],"recommendedChanges":["string"],"userSafetyNotes":["string"]}'
  ].join("\n");

  const raw = await callGemini(prompt, systemInstruction);
  const parsed = JSON.parse(raw) as Record<string, unknown>;

  return {
    verdict: normalizeVerdict(typeof parsed.verdict === "string" ? parsed.verdict : undefined),
    riskLevel: normalizeRiskLevel(typeof parsed.riskLevel === "string" ? parsed.riskLevel : undefined),
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : "Gemini review completed with limited confidence.",
    findings: normalizeFindings(parsed.findings),
    recommendedChanges: normalizeStringList(parsed.recommendedChanges),
    userSafetyNotes: normalizeStringList(parsed.userSafetyNotes),
    source: "gemini"
  };
}

function validate(body: ReviewRequestBody): { ok: true; value: Required<ReviewRequestBody> } | { ok: false; error: string } {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const agentType = typeof body.agentType === "string" ? body.agentType.trim() : "";
  const price = typeof body.price === "string" ? body.price.trim() : "";
  const configSchema = typeof body.configSchema === "string" ? body.configSchema.trim() : "";
  const workflowSummary = typeof body.workflowSummary === "string" ? body.workflowSummary.trim() : "";

  if (!name || !description || !agentType || !price || !configSchema || !workflowSummary) {
    return { ok: false, error: "name, description, agentType, price, configSchema, and workflowSummary are required." };
  }

  return {
    ok: true,
    value: {
      name,
      description,
      agentType,
      price,
      configSchema,
      workflowSummary
    }
  };
}

export async function POST(req: Request) {
  let body: ReviewRequestBody;
  try {
    body = (await req.json()) as ReviewRequestBody;
  } catch {
    return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
  }

  const validated = validate(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const heuristic = heuristicReview(validated.value);

  try {
    const haystack = buildSubmissionText(validated.value);
    const guards = detectSafetyGuards(haystack);
    const gemini = await geminiReview(validated.value);
    const normalizedGemini = recalculateOutcome({
      ...gemini,
      findings: filterContradictoryFindings(gemini.findings, guards)
    });

    const merged = mergeReviewResults(heuristic, normalizedGemini);
    return NextResponse.json(recalculateOutcome(merged), { status: 200 });
  } catch (error) {
    console.warn("[PUBLISH_REVIEW] Gemini review unavailable:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(heuristic, { status: 200 });
  }
}
