/**
 * Shared Gemini client wrapper for all backend AI operations.
 * Exports:
 * - callGemini(prompt, systemInstruction?): invokes Gemini 2.5 Flash and returns clean plain text.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-2.5-flash";
const RETRY_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function stripMarkdownFences(input: string): string {
  return input
    .replace(/```(?:json|ts|typescript|javascript)?/gi, "")
    .replace(/```/g, "")
    .trim();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unknown Gemini error";
}

function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === "object") {
    const possible = error as { status?: number; statusCode?: number; message?: string };
    if (possible.status === 429 || possible.statusCode === 429) {
      return true;
    }
    if (typeof possible.message === "string" && (possible.message.includes("429") || /rate\s*limit/i.test(possible.message))) {
      return true;
    }
  }
  return false;
}

async function generate(model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>, prompt: string): Promise<string> {
  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  const text = response.response.text();
  if (!text || !text.trim()) {
    throw new Error("Gemini returned an empty response");
  }

  return stripMarkdownFences(text);
}

export async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini configuration error: GEMINI_API_KEY is missing");
  }

  const normalizedPrompt = prompt.trim();
  if (!normalizedPrompt) {
    throw new Error("Gemini call failed: prompt is required");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemInstruction?.trim() || undefined
  });

  try {
    return await generate(model, normalizedPrompt);
  } catch (error: unknown) {
    if (isRateLimitError(error)) {
      await sleep(RETRY_DELAY_MS);
      try {
        return await generate(model, normalizedPrompt);
      } catch (retryError: unknown) {
        throw new Error(`Gemini request failed after retry: ${getErrorMessage(retryError)}`);
      }
    }

    throw new Error(`Gemini request failed: ${getErrorMessage(error)}`);
  }
}
