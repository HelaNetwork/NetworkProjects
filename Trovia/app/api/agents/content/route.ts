import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

type ContentConfig = {
  platform: string;
  topic: string;
  tone: string;
  style: string;
  cta: string;
  audience: string;
  characterLimit: number | null;
};

type ContentResponse = {
  ideas: [string, string, string];
  metadata: {
    platform: string;
    tone: string;
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

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseBody(body: unknown): ContentConfig {
  if (!isRecord(body)) {
    throw { statusCode: 400, message: "Request body must be a JSON object." };
  }

  const source = isRecord(body.config) ? body.config : body;
  const platform = asString(source.platform) || "X";

  // Backward compatibility with previous payloads.
  const topic = asString(source.topic) || asString(source.message) || "crypto markets";
  const tone = asString(source.tone) || "professional";
  const style = asString(source.style) || asString(source.brandContext) || "informative";
  const cta = asString(source.cta) || "Learn more";
  const audience = asString(source.audience) || "retail crypto users";

  const characterLimitRaw = asFiniteNumber(source.characterLimit);
  const characterLimit = characterLimitRaw && characterLimitRaw > 0 ? Math.floor(characterLimitRaw) : null;

  return {
    platform,
    topic,
    tone,
    style,
    cta,
    audience,
    characterLimit
  };
}

function truncateIdea(idea: string, limit: number | null): string {
  if (!limit || idea.length <= limit) {
    return idea;
  }

  if (limit < 10) {
    return idea.slice(0, limit);
  }

  const sliced = idea.slice(0, limit - 1).trimEnd();
  return `${sliced}...`;
}

function extractJsonCandidate(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) {
    return fenced[1].trim();
  }

  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

function normalizeIdeas(value: unknown, topic: string): [string, string, string] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const cleaned = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  const fallback = [
    `Quick take on ${topic}: what changed today and why it matters now.`,
    `${topic} breakdown in plain English: key signal, key risk, key watchpoint.`,
    `One actionable ${topic} insight today plus what to monitor next.`
  ];

  while (cleaned.length < 3) {
    cleaned.push(fallback[cleaned.length]);
  }

  return [cleaned[0], cleaned[1], cleaned[2]];
}

function parseIdeas(raw: string, topic: string): [string, string, string] | null {
  const candidate = extractJsonCandidate(raw);

  try {
    const parsed = JSON.parse(candidate);
    return normalizeIdeas(parsed, topic);
  } catch {
    return null;
  }
}

async function generateIdeas(config: ContentConfig): Promise<[string, string, string]> {
  const systemPrompt = [
    "You are Social Sentinel AI.",
    "Goal: generate social media post ideas for user-selected platform.",
    "Respond ONLY as a valid JSON array of 3 strings.",
    "No markdown, no explanation, no extra keys."
  ].join("\n");

  const prompt = [
    "Context:",
    `- Platform: ${config.platform}`,
    `- Topic: ${config.topic}`,
    `- Tone: ${config.tone}`,
    `- Style: ${config.style}`,
    `- CTA: ${config.cta}`,
    `- Audience: ${config.audience}`,
    `- Constraints: each post <= ${config.characterLimit ?? "platform default"} chars${config.style.toLowerCase().includes("hashtag") ? ", include hashtag strategy" : ""}.`
  ].join("\n");

  const firstRaw = await callGemini(prompt, systemPrompt);
  const firstParsed = parseIdeas(firstRaw, config.topic);
  if (firstParsed) {
    return firstParsed.map((idea) => truncateIdea(idea, config.characterLimit)) as [string, string, string];
  }

  const retryPrompt = [
    prompt,
    "",
    "Your previous response was invalid.",
    "Return valid JSON array only with exactly 3 strings."
  ].join("\n");

  const retryRaw = await callGemini(retryPrompt, systemPrompt);
  const retryParsed = parseIdeas(retryRaw, config.topic);
  if (retryParsed) {
    return retryParsed.map((idea) => truncateIdea(idea, config.characterLimit)) as [string, string, string];
  }

  const fallback: [string, string, string] = [
    truncateIdea(`What ${config.topic} means for ${config.audience} right now, plus one practical next step.`, config.characterLimit),
    truncateIdea(`${config.topic} in 3 bullets: trend, risk, opportunity. ${config.cta}.`, config.characterLimit),
    truncateIdea(`Today on ${config.platform}: ${config.topic} outlook with a ${config.tone} tone and clear takeaway.`, config.characterLimit)
  ];

  return fallback;
}

export async function POST(req: Request) {
  console.log("[CONTENT] Received request");

  try {
    const body = await req.json();
    const config = parseBody(body);
    const ideas = await generateIdeas(config);

    const response: ContentResponse = {
      ideas,
      metadata: {
        platform: config.platform,
        tone: config.tone,
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
    const message = mapped.message || "Content agent execution failed.";
    console.error(`[CONTENT] Error: ${message}`);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
