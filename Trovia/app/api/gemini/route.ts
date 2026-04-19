import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model = "gemini-2.5-flash", maxTokens = 1024 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }

    // Placeholder for Gemini API call
    // In production, this would call: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("Gemini API key not configured");
      // Return mock response for development
      return NextResponse.json({
        text: `This is a development placeholder response to: "${prompt}". Configure NEXT_PUBLIC_GEMINI_API_KEY to use real Gemini API.`,
        usage: {
          inputTokens: 10,
          outputTokens: 25,
        },
      });
    }

    // Call actual Gemini API
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              maxOutputTokens: maxTokens,
              temperature: 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();

      return NextResponse.json({
        text: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response",
        usage: data.usageMetadata,
      });
    } catch (error) {
      console.error("Gemini API call failed:", error);
      // Return mock response on error
      return NextResponse.json({
        text: `Error calling Gemini API. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is configured correctly.`,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Gemini endpoint error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
