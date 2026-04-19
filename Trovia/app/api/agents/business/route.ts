import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

type TaskType = "strategy" | "analysis" | "marketing" | "general";

type BusinessConfig = {
  taskType: TaskType;
  query: string;
  context: string;
  language: string;
  formality: "formal" | "informal";
};

type BusinessResponse = {
  result: string;
  metadata: {
    taskType: TaskType;
    confidence: number;
    generatedAt: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseTaskType(raw: unknown): TaskType {
  const normalized = asString(raw)?.toLowerCase();
  if (normalized === "strategy" || normalized === "analysis" || normalized === "marketing") {
    return normalized;
  }
  return "general";
}

function parseFormality(raw: unknown): "formal" | "informal" {
  const normalized = asString(raw)?.toLowerCase();
  return normalized === "informal" ? "informal" : "formal";
}

function parseBody(body: unknown): BusinessConfig {
  if (!isRecord(body)) {
    throw { statusCode: 400, message: "Request body must be a JSON object." };
  }

  const source = isRecord(body.config) ? body.config : body;

  const query = asString(source.query);
  if (!query) {
    throw { statusCode: 400, message: "query is required." };
  }

  const context = asString(source.context) || asString(source.businessContext) || "";
  if (!context) {
    throw { statusCode: 400, message: "businessContext is required." };
  }

  const language = asString(source.language) || "English";

  return {
    taskType: parseTaskType(source.taskType),
    query,
    context,
    language,
    formality: parseFormality(source.formality)
  };
}

function getSystemPrompt(taskType: TaskType, language: string, formality: "formal" | "informal"): string {
  const baseInstructions = [
    `Always respond in ${language}.`,
    `Use a ${formality} tone.`,
    "Be concise, practical, and action-oriented.",
    "Avoid guaranteed outcomes."
  ];

  if (taskType === "strategy") {
    return [
      "You are an expert business strategist.",
      "Focus on market positioning, competitive edge, and execution roadmap.",
      ...baseInstructions
    ].join("\n");
  }

  if (taskType === "analysis") {
    return [
      "You are a data-driven business analyst.",
      "Focus on metrics, assumptions, scenario outcomes, and decision trade-offs.",
      ...baseInstructions
    ].join("\n");
  }

  if (taskType === "marketing") {
    return [
      "You are a growth marketing advisor.",
      "Focus on channels, audience segmentation, messaging, and conversion optimization.",
      ...baseInstructions
    ].join("\n");
  }

  return [
    "You are a business advisor.",
    "Help with practical planning across strategy, operations, and growth.",
    ...baseInstructions
  ].join("\n");
}

function estimateConfidence(result: string, taskType: TaskType): number {
  const lengthSignal = Math.min(1, result.length / 700);
  const keywordBoosts: Record<TaskType, string[]> = {
    strategy: ["position", "roadmap", "priorit", "moat", "market"],
    analysis: ["metric", "scenario", "assumption", "cost", "roi"],
    marketing: ["channel", "campaign", "conversion", "audience", "funnel"],
    general: ["plan", "action", "priority", "risk", "timeline"]
  };

  const lowered = result.toLowerCase();
  const matches = keywordBoosts[taskType].filter((word) => lowered.includes(word)).length;
  const keywordSignal = Math.min(1, matches / 4);
  const score = 0.5 + lengthSignal * 0.25 + keywordSignal * 0.25;
  return Number(Math.max(0.5, Math.min(0.99, score)).toFixed(2));
}

export async function POST(req: Request) {
  console.log("[BUSINESS] Received request");

  try {
    const body = await req.json();
    const config = parseBody(body);
    const systemPrompt = getSystemPrompt(config.taskType, config.language, config.formality);

    const userPrompt = [
      `Business context: ${config.context}`,
      `Task type: ${config.taskType}`,
      `User request: ${config.query}`,
      "Response format: short answer, then 3-5 numbered action steps."
    ].join("\n");

    const result = await callGemini(userPrompt, systemPrompt);
    const response: BusinessResponse = {
      result,
      metadata: {
        taskType: config.taskType,
        confidence: estimateConfidence(result, config.taskType),
        generatedAt: new Date().toISOString()
      }
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
    }

    const mapped = error as { statusCode?: number; message?: string };
    const statusCode = mapped.statusCode && mapped.statusCode >= 400 ? mapped.statusCode : 500;
    const message = mapped.message || "Business agent execution failed.";
    console.error(`[BUSINESS] Error: ${message}`);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
