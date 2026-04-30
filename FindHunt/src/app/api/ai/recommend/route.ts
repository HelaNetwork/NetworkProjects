import { NextResponse } from "next/server";
import OpenAI from "openai";

type Body = {
  goals?: string;
  walletAddress?: string;
  context?: {
    nativeBalance?: string;
    vaultBalance?: string;
    yieldAllocated?: string;
    dailyLimit?: string;
    spentToday?: string;
  };
};

function heuristicActions(goals: string): { actions: string[]; executionHints: string[] } {
  const g = goals.toLowerCase();
  const actions: string[] = [];
  const executionHints: string[] = [];
  if (g.includes("save") || g.includes("saving")) {
    actions.push("Move 15–20% of free balance into TreasurerVault savings.");
    executionHints.push("vault_deposit_percent:15");
  }
  if (g.includes("yield") || g.includes("max")) {
    actions.push("Allocate 10% of vault balance to simulated yield tracking.");
    executionHints.push("yield_allocate_percent:10");
  }
  if (g.includes("risk") || g.includes("minimize")) {
    actions.push("Cap daily outflows and keep yield allocation ≤10% until risk posture improves.");
    executionHints.push("budget_tighten:15");
  }
  if (g.includes("subscription") || g.includes("recurring")) {
    actions.push("Review subscriptions; prefund SubscriptionManager for automated payouts.");
    executionHints.push("subscription_review:true");
  }
  if (actions.length === 0) {
    actions.push("Maintain emergency buffer in vault; review budget weekly.");
    executionHints.push("default:true");
  }
  return { actions, executionHints };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const goals = body.goals?.trim() || "Balanced growth";
  const key = process.env.OPENAI_API_KEY;

  if (key) {
    try {
      const client = new OpenAI({ apiKey: key });
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a concise crypto treasurer for Hela Chain. Return ONLY valid JSON: {\"actions\": string[], \"executionHints\": string[]} where executionHints are short machine hints like vault_deposit_percent:10 or yield_allocate_percent:5.",
          },
          {
            role: "user",
            content: `User goals: ${goals}\nWallet: ${body.walletAddress || "unknown"}\nContext: ${JSON.stringify(body.context || {})}`,
          },
        ],
        temperature: 0.4,
      });
      const text = completion.choices[0]?.message?.content?.trim() || "";
      const json = JSON.parse(text.replace(/^```json\n?|\n?```$/g, "")) as {
        actions?: string[];
        executionHints?: string[];
      };
      return NextResponse.json({
        actions: json.actions || [],
        executionHints: json.executionHints || [],
        source: "openai",
      });
    } catch {
      // fall through
    }
  }

  const h = heuristicActions(goals);
  return NextResponse.json({ ...h, source: "heuristic" });
}
