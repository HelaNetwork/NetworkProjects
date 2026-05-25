/**
 * Generates a complete agent schema and executable runtime code using Gemini.
 * Exports:
 * - POST: creates an AgentObject + execution function source from natural language prompt.
 */

import { NextResponse } from "next/server";
import { callGemini } from "../../../../lib/gemini";
import type { AgentField, AgentObject } from "../../../../types/agent";

type GenerateRequestBody = {
  prompt?: string;
  developerAddress?: string;
};

type ValidationResult =
  | { ok: true; agent: AgentObject }
  | { ok: false; status: number; error: string };

const VALID_AGENT_TYPES: AgentObject["agentType"][] = [
  "trading",
  "farming",
  "scheduling",
  "rebalancing",
  "content",
  "business"
];

const VALID_FIELD_TYPES: AgentField["type"][] = ["text", "number", "select", "address"];

function stripMarkdownFences(input: string): string {
  return input
    .replace(/```(?:json|ts|typescript|javascript)?/gi, "")
    .replace(/```/g, "")
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function parseJsonPayload(raw: string): unknown | null {
  const cleaned = stripMarkdownFences(raw);
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function normalizeField(fieldInput: unknown): AgentField | null {
  if (!isRecord(fieldInput)) {
    return null;
  }

  const key = asNonEmptyString(fieldInput.key);
  const label = asNonEmptyString(fieldInput.label);
  const type = asNonEmptyString(fieldInput.type);
  const required = fieldInput.required;
  const placeholderValue = fieldInput.placeholder;

  if (!key || !label || !type || typeof required !== "boolean") {
    return null;
  }

  if (!VALID_FIELD_TYPES.includes(type as AgentField["type"])) {
    return null;
  }

  const normalized: AgentField = {
    key,
    label,
    type: type as AgentField["type"],
    required
  };

  if (typeof placeholderValue === "string" && placeholderValue.trim()) {
    normalized.placeholder = placeholderValue.trim();
  }

  if (normalized.type === "select") {
    if (!Array.isArray(fieldInput.options) || fieldInput.options.length === 0) {
      return null;
    }

    const options = fieldInput.options
      .map((option) => (typeof option === "string" ? option.trim() : ""))
      .filter((option) => option.length > 0);

    if (options.length === 0) {
      return null;
    }

    normalized.options = options;
  }

  return normalized;
}

function normalizeAgent(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, status: 400, error: "Generated schema is not a JSON object" };
  }

  const name = asNonEmptyString(input.name);
  if (!name) {
    return { ok: false, status: 400, error: "Generated schema missing name" };
  }

  const description = asNonEmptyString(input.description);
  if (!description) {
    return { ok: false, status: 400, error: "Generated schema missing description" };
  }

  const agentType = asNonEmptyString(input.agentType);
  if (!agentType || !VALID_AGENT_TYPES.includes(agentType as AgentObject["agentType"])) {
    return { ok: false, status: 400, error: "Generated schema has invalid agentType" };
  }

  const priceRaw = input.priceHLUSD;
  const priceHLUSD =
    typeof priceRaw === "number" ? priceRaw : typeof priceRaw === "string" ? Number(priceRaw) : Number.NaN;
  if (!Number.isFinite(priceHLUSD) || priceHLUSD < 1 || priceHLUSD > 100) {
    return { ok: false, status: 400, error: "Generated schema has invalid priceHLUSD" };
  }

  const configSchemaValue = input.configSchema;
  if (!isRecord(configSchemaValue) || !Array.isArray(configSchemaValue.fields)) {
    return { ok: false, status: 400, error: "Generated schema missing configSchema fields" };
  }

  if (configSchemaValue.fields.length < 1) {
    return { ok: false, status: 400, error: "Generated schema must include at least one config field" };
  }

  const normalizedFields: AgentField[] = [];
  for (const field of configSchemaValue.fields) {
    const normalizedField = normalizeField(field);
    if (!normalizedField) {
      return { ok: false, status: 400, error: "Generated schema contains invalid config field definitions" };
    }
    normalizedFields.push(normalizedField);
  }

  const executionLogic = asNonEmptyString(input.executionLogic);
  if (!executionLogic) {
    return { ok: false, status: 400, error: "Generated schema missing executionLogic" };
  }

  const geminiPrompt = asNonEmptyString(input.geminiPrompt);
  if (!geminiPrompt) {
    return { ok: false, status: 400, error: "Generated schema missing geminiPrompt" };
  }

  if (!Array.isArray(input.tags) || input.tags.length !== 3) {
    return { ok: false, status: 400, error: "Generated schema must include exactly 3 tags" };
  }

  const tags = input.tags
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter((tag) => tag.length > 0);
  if (tags.length !== 3) {
    return { ok: false, status: 400, error: "Generated schema tags are invalid" };
  }

  const estimatedRuntime = asNonEmptyString(input.estimatedRuntime);
  if (!estimatedRuntime) {
    return { ok: false, status: 400, error: "Generated schema missing estimatedRuntime" };
  }

  return {
    ok: true,
    agent: {
      name,
      description,
      agentType: agentType as AgentObject["agentType"],
      priceHLUSD,
      configSchema: { fields: normalizedFields },
      executionLogic,
      geminiPrompt,
      tags,
      estimatedRuntime
    }
  };
}

export async function POST(req: Request) {
  console.log("[GENERATE] Received request");

  let body: GenerateRequestBody;
  try {
    body = (await req.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    console.log("[GENERATE] Step 1: generating schema with Gemini");

    const schemaSystemInstruction = [
      "You are Trovia's AI agent schema generator.",
      "Return ONLY one valid JSON object. No markdown, no prose, no code fences.",
      "Every field must be internally consistent: agentType, description, executionLogic, and geminiPrompt must match the same use case.",
      "Never mix business-assistant behavior with portfolio-rebalancing behavior.",
      "Any non-JSON output will break production parsing."
    ].join("\n");

    const schemaUserPrompt = `Generate a complete agent schema for this request: ${prompt}
Return ONLY this exact JSON structure:
{
  name: string (max 4 words),
  description: string (one sentence, buyer-focused, no technical jargon),
  agentType: one of exactly: trading | farming | scheduling | rebalancing | content | business,
  priceHLUSD: number between 1 and 100,
  configSchema: {
    fields: [
      {
        key: camelCase string,
        label: human readable string,
        type: text | number | select | address,
        required: boolean,
        options: string array (only if type is select, else omit),
        placeholder: string
      }
    ]
  },
  executionLogic: string (plain English, step by step, what this agent does),
  geminiPrompt: string (the exact system prompt Gemini uses when THIS agent runs — written as if you ARE the agent executing),
  tags: array of exactly 3 strings,
  estimatedRuntime: string (e.g. every 5 minutes / on trigger / real-time / on demand)
}

Type intent rules (must be respected):
- trading: price threshold monitoring, trigger alerts, simulated swap/trade actions
- farming: LP/APY monitoring, compounding decisions, yield optimization guidance
- scheduling: recurring transfers, cadence logic, next execution calculation
- rebalancing: portfolio allocation drift, target/current weights, rebalance recommendation
- content: social/media reply drafting, tone adaptation, response alternatives
- business: business operations/planning/email/report support (NOT portfolio drift or token allocation)

Critical mismatch rule:
- If agentType is "business", do not mention rebalancing, allocation drift, or portfolio weight optimization.
- If agentType is "rebalancing", focus on allocations and drift; do not frame it as generic business assistant output.`;

    const firstSchemaRaw = await callGemini(schemaUserPrompt, schemaSystemInstruction);
    let parsedSchema = parseJsonPayload(firstSchemaRaw);

    if (!parsedSchema) {
      console.log("[GENERATE] First schema parse failed, retrying once");
      const retrySchemaRaw = await callGemini(schemaUserPrompt, schemaSystemInstruction);
      parsedSchema = parseJsonPayload(retrySchemaRaw);

      if (!parsedSchema) {
        return NextResponse.json({ error: "Failed to parse agent schema" }, { status: 500 });
      }
    }

    const validated = normalizeAgent(parsedSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: validated.status });
    }

    const agent = validated.agent;
    console.log("[GENERATE] Step 2: generating execution function with Gemini");

    const executionSystemInstruction = [
      "You are Trovia's JavaScript runtime code generator.",
      "Return ONLY valid runnable JavaScript.",
      "No imports, no exports, no markdown, no explanation.",
      "The output is executed via new Function(); any non-code output will crash runtime."
    ].join("\n");

    const executionUserPrompt = `Generate the execution function for this agent:
Name: ${agent.name}
Type: ${agent.agentType}
Logic: ${agent.executionLogic}
Gemini Prompt: ${agent.geminiPrompt}
Config Fields: ${JSON.stringify(agent.configSchema.fields)}

Return ONLY this function (no imports, no exports):
async function executeAgent(config) {
  // your implementation here
}

Rules for implementation:
- Access config values using config['fieldKey'] matching the configSchema keys
- For content and business agentType: build a detailed prompt using config values and call await callGemini(prompt, systemInstruction)
- For trading, farming, rebalancing agentType: simulate realistic logic using config values, return structured data object
- For scheduling agentType: validate config, calculate next execution time, return confirmation
- For content/business, define: const systemInstruction = ${JSON.stringify(agent.geminiPrompt)}
- callGemini is globally available as callGemini(prompt, systemInstruction?)
- Never import anything — callGemini is the only external dependency
- Wrap everything in try/catch — on error return { success: false, result: error.message }
- Must be syntactically valid JavaScript (Node.js runtime, no TypeScript type annotations)`;

    const executionRaw = await callGemini(executionUserPrompt, executionSystemInstruction);
    const executionCode = stripMarkdownFences(executionRaw);

    if (!executionCode) {
      return NextResponse.json({ error: "Failed to generate execution function" }, { status: 500 });
    }

    // Validate generated source is executable JavaScript before returning it.
    try {
      const maybeFn = new Function(`return (${executionCode})`)();
      if (typeof maybeFn !== "function") {
        return NextResponse.json({ error: "Generated execution code is not a function" }, { status: 500 });
      }
    } catch {
      return NextResponse.json({ error: "Failed to generate executable JavaScript function" }, { status: 500 });
    }

    console.log("[GENERATE] Generation complete");
    return NextResponse.json(
      {
        agent,
        executionCode,
        ready: true
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Generation failed";
    console.error("[GENERATE] Error", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
